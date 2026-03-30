import React, { useState, useEffect } from 'react';
import {
    Building2,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Save,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { departmentsService } from '../services/departments';
import { DepartmentResponse } from '../services/types';
import { useApi } from '../hooks/useApi';

export default function Departments() {
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<DepartmentResponse | null>(null);
    const [formName, setFormName] = useState('');

    const { execute: fetchDepartments, loading: loadingList } = useApi<DepartmentResponse[]>();
    const { execute: createDept, loading: creating } = useApi<DepartmentResponse>();
    const { execute: updateDept, loading: updating } = useApi<DepartmentResponse>();
    const { execute: deleteDept, loading: deleting } = useApi<void>();

    const loadDepartments = async () => {
        const result = await fetchDepartments(departmentsService.listDepartments());
        if (result.success && result.data) {
            setDepartments(result.data);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleOpenModal = (dept?: DepartmentResponse) => {
        if (dept) {
            setEditingDept(dept);
            setFormName(dept.name);
        } else {
            setEditingDept(null);
            setFormName('');
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            alert('Please enter department name');
            return;
        }

        if (editingDept) {
            const result = await updateDept(
                departmentsService.renameDepartment(editingDept.id, formName)
            );
            if (result.success) {
                await loadDepartments();
                setIsModalOpen(false);
            } else {
                alert(result.error);
            }
        } else {
            const result = await createDept(departmentsService.createDepartment(formName));
            if (result.success) {
                await loadDepartments();
                setIsModalOpen(false);
            } else {
                alert(result.error);
            }
        }
    };

    const handleDelete = async (deptId: number, deptName: string) => {
        if (confirm(`Are you sure you want to delete department "${deptName}"?`)) {
            const result = await deleteDept(departmentsService.deleteDepartment(deptId));
            if (result.success) {
                await loadDepartments();
            } else {
                alert(result.error);
            }
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">Departments</h3>
                    <p className="text-sm text-text-secondary">Manage call center departments</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                >
                    <Plus className="size-4" />
                    Add Department
                </button>
            </div>

            {/* Search */}
            <div className="bg-bg-card border border-white/5 rounded-2xl p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-all"
                    />
                </div>
            </div>

            {/* Departments Grid */}
            {loadingList ? (
                <div className="flex items-center justify-center py-12">
                    <div className="size-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepartments.map((dept) => (
                        <motion.div
                            key={dept.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-bg-card border border-white/5 rounded-2xl p-6 hover:border-accent/30 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-accent/10 rounded-xl">
                                    <Building2 className="size-6 text-accent" />
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(dept)}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-accent"
                                    >
                                        <Edit2 className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept.id, dept.name)}
                                        disabled={deleting}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-error"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>

                            <h4 className="text-lg font-bold mb-2">{dept.name}</h4>
                            {/* <p className="text-xs text-text-secondary">ID: {dept.id}</p> */}
                        </motion.div>
                    ))}
                </div>
            )}

            {filteredDepartments.length === 0 && !loadingList && (
                <div className="text-center py-12">
                    <Layers className="size-12 text-text-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-text-secondary">No departments found</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-bg-card border border-white/10 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">
                                        {editingDept ? 'Edit Department' : 'Add New Department'}
                                    </h3>
                                    <p className="text-sm text-text-secondary">
                                        {editingDept ? 'Update department name' : 'Create a new department'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="size-5 text-text-secondary" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">
                                        Department Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="e.g., Technical Support"
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={creating || updating}
                                    className="flex-1 py-2.5 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {(creating || updating) ? (
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="size-4" />
                                    )}
                                    {editingDept ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}