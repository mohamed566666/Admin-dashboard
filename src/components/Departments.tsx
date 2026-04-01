import React, { useState, useEffect } from 'react';
import {
    Building2,
    Plus,
    Edit2,
    Trash2,
    Search,
    X,
    Save,
    Layers,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { departmentsService } from '../services/departments';
import { DepartmentResponse, PaginatedResponse } from '../services/types';
import { useApi } from '../hooks/useApi';

export default function Departments() {
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

    // ✅ Pagination State
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 5,
        total: 0,
        totalPages: 0
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<DepartmentResponse | null>(null);
    const [formName, setFormName] = useState('');

    // ✅ Type: PaginatedResponse<DepartmentResponse> عشان الـ listDepartmentsPaginated
    const { execute: fetchDepartments, loading: loadingList } = useApi<PaginatedResponse<DepartmentResponse>>();
    const { execute: createDept, loading: creating } = useApi<DepartmentResponse>();
    const { execute: updateDept, loading: updating } = useApi<DepartmentResponse>();
    const { execute: deleteDept, loading: deleting } = useApi<void>();

    // ✅ استبدل الـ loadDepartments function باللي تحت:

    const loadDepartments = async () => {
        console.log('🏢 [Departments] === Loading Departments ===');

        const result = await fetchDepartments(
            departmentsService.listDepartmentsPaginated(pagination.page, pagination.pageSize)
        );

        if (result.success && result.data) {
            console.log('✅ Departments loaded:', result.data.data.length);
            setDepartments(result.data.data);
            setPagination(prev => ({
                ...prev,
                total: result.data!.total,
                totalPages: result.data!.total_pages
            }));
        } else {
            console.error('❌ Failed to load departments:', result.error);
            setDepartments([]);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, [pagination.page, pagination.pageSize]);

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
            const result = await updateDept(departmentsService.renameDepartment(editingDept.id, formName));
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

    // ✅ Pagination Handlers
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page }));
        }
    };

    const changePageSize = (newSize: number) => {
        setPagination({
            page: 1,
            pageSize: newSize,
            total: pagination.total,
            totalPages: pagination.totalPages
        });
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        const maxVisible = 5;
        let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
        let end = Math.min(pagination.totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        return (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <div className="text-xs text-text-secondary">
                    Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                    {/* Page Size Selector */}
                    <select
                        value={pagination.pageSize}
                        onChange={(e) => changePageSize(Number(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-accent"
                    >
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={25}>25 / page</option>
                        <option value={50}>50 / page</option>
                    </select>

                    <div className="flex items-center gap-1">
                        {/* First Page */}
                        <button
                            onClick={() => goToPage(1)}
                            disabled={pagination.page === 1}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronsLeft className="size-4" />
                        </button>

                        {/* Previous Page */}
                        <button
                            onClick={() => goToPage(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="size-4" />
                        </button>

                        {/* Page Numbers */}
                        {start > 1 && (
                            <>
                                <button
                                    onClick={() => goToPage(1)}
                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-sm"
                                >
                                    1
                                </button>
                                {start > 2 && <span className="px-2 text-text-secondary">...</span>}
                            </>
                        )}

                        {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`size-8 flex items-center justify-center rounded-lg transition-colors text-sm font-medium ${page === pagination.page
                                    ? 'bg-accent text-white'
                                    : 'hover:bg-white/5'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {end < pagination.totalPages && (
                            <>
                                {end < pagination.totalPages - 1 && <span className="px-2 text-text-secondary">...</span>}
                                <button
                                    onClick={() => goToPage(pagination.totalPages)}
                                    className="size-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-sm"
                                >
                                    {pagination.totalPages}
                                </button>
                            </>
                        )}

                        {/* Next Page */}
                        <button
                            onClick={() => goToPage(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="size-4" />
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() => goToPage(pagination.totalPages)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronsRight className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
                <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredDepartments.map((dept) => (
                            <motion.div
                                key={dept.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-accent/30 transition-all group"
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
                            </motion.div>
                        ))}
                    </div>

                    {filteredDepartments.length === 0 && (
                        <div className="text-center py-12">
                            <Layers className="size-12 text-text-secondary mx-auto mb-3 opacity-50" />
                            <p className="text-text-secondary">No departments found</p>
                        </div>
                    )}

                    {/* ✅ Pagination Component */}
                    {renderPagination()}
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