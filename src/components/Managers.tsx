import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Search,
    Filter,
    UserPlus,
    Building2,
    Shield,
    X,
    Save,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminService } from '../services/admin';
import { managersService } from '../services/managers';
import { departmentsService } from '../services/departments';
import { UserResponse, DepartmentResponse } from '../services/types';
import { useApi } from '../hooks/useApi';

export default function Managers() {
    const [managers, setManagers] = useState<UserResponse[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingManager, setEditingManager] = useState<UserResponse | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        department_id: '',
    });

    const { execute: fetchManagers, loading: loadingList } = useApi<UserResponse[]>();
    const { execute: fetchDepartments } = useApi<DepartmentResponse[]>();
    const { execute: createManager, loading: creating } = useApi<UserResponse>();
    const { execute: deleteManager, loading: deleting } = useApi<void>();

    const loadData = async () => {
        console.log('👔 [Managers] === Loading Data ===');

        console.log('📡 Fetching departments first...');
        const deptsResult = await fetchDepartments(departmentsService.listDepartments());
        if (deptsResult.success && deptsResult.data) {
            console.log('✅ Departments loaded:', deptsResult.data.length);
            setDepartments(deptsResult.data);
        }

        console.log('📡 Fetching managers...');
        const managersResult = await fetchManagers(managersService.listManagers());
        if (managersResult.success && managersResult.data) {
            console.log('✅ Managers loaded:', managersResult.data.length);
            setManagers(managersResult.data);
        }

        console.log('👔 [Managers] === Loading Complete ===');
    };

    useEffect(() => {
        loadData();
    }, []);

    const departmentNamesMap = useMemo(() => {
        const map = new Map<number, string>();
        departments.forEach(dept => {
            if (dept?.id) map.set(dept.id, dept.name || 'Unknown');
        });
        return map;
    }, [departments]);

    const getDepartmentName = (deptId: number | null | undefined) => {
        if (!deptId) return 'Unassigned';
        return departmentNamesMap.get(deptId) || 'Unknown';
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-error/10 text-error';
            case 'manager': return 'bg-accent/10 text-accent';
            default: return 'bg-white/10 text-text-secondary';
        }
    };

    const filteredManagers = useMemo(() => {
        return managers.filter(manager => {
            const matchesSearch = manager.username.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = selectedDepartment === 'all' ||
                (selectedDepartment === 'unassigned' && !manager.department_id) ||
                manager.department_id?.toString() === selectedDepartment;
            return matchesSearch && matchesDept;
        });
    }, [managers, searchTerm, selectedDepartment]);

    const handleOpenModal = (manager?: UserResponse) => {
        if (manager) {
            setEditingManager(manager);
            setFormData({
                username: manager.username,
                password: '',
                department_id: manager.department_id?.toString() || '',
            });
        } else {
            setEditingManager(null);
            setFormData({
                username: '',
                password: '',
                department_id: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.username) {
            alert('Please enter username');
            return;
        }

        if (!editingManager && !formData.password) {
            alert('Please enter password');
            return;
        }

        const deptId = formData.department_id ? parseInt(formData.department_id) : null;

        const result = await createManager(
            adminService.createManager(formData.username, formData.password, deptId)
        );

        if (result.success) {
            await loadData();
            setIsModalOpen(false);
            setFormData({ username: '', password: '', department_id: '' });
        } else {
            alert(result.error);
        }
    };

    const handleDelete = async (managerId: number, username: string) => {
        if (confirm(`Are you sure you want to delete manager "${username}"?`)) {
            const result = await deleteManager(adminService.deleteManager(managerId));
            if (result.success) {
                await loadData();
            } else {
                alert(result.error);
            }
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">Managers Management</h3>
                    <p className="text-sm text-text-secondary">Add, edit, and manage call center managers</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                >
                    <UserPlus className="size-4" />
                    Add New Manager
                </button>
            </div>

            <div className="bg-bg-card border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="size-4 text-text-secondary ml-2" />
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-all cursor-pointer"
                    >
                        <option value="all">All Departments</option>
                        <option value="unassigned">Unassigned</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id.toString()}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loadingList ? (
                <div className="flex items-center justify-center py-12">
                    <div className="size-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Manager</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Department</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Created</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredManagers.map((manager) => (
                                    <tr key={manager.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                                                    {manager.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{manager.username}</p>
                                                    {/* <p className="text-[10px] text-text-secondary">ID: {manager.id}</p> */}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="size-4 text-text-secondary" />
                                                <span className="text-sm">{getDepartmentName(manager.department_id)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${getRoleColor(manager.role)}`}>
                                                {manager.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {new Date(manager.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(manager)}
                                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-accent"
                                                >
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(manager.id, manager.username)}
                                                    disabled={deleting}
                                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-error"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredManagers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="size-12 text-text-secondary mx-auto mb-3 opacity-50" />
                            <p className="text-text-secondary">No managers found</p>
                        </div>
                    )}
                </div>
            )}

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
                            className="bg-bg-card border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">
                                        {editingManager ? 'Edit Manager' : 'Add New Manager'}
                                    </h3>
                                    <p className="text-sm text-text-secondary">
                                        {editingManager ? 'Update manager information' : 'Create a new manager account'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="size-5 text-text-secondary" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Username *</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="Enter username"
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>

                                {!editingManager && (
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Password *</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="Enter password"
                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-colors pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                                            >
                                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Department</label>
                                    <select
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
                                        style={{ color: formData.department_id ? 'inherit' : '#9CA3AF' }}
                                    >
                                        <option value="" className="text-text-secondary">-- Select a department --</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id.toString()} className="text-text-primary">
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    {departments.length === 0 && (
                                        <p className="text-xs text-warning mt-1">No departments available. Please add departments first.</p>
                                    )}
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
                                    disabled={creating}
                                    className="flex-1 py-2.5 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {creating ? (
                                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save className="size-4" />
                                    )}
                                    {editingManager ? 'Update Manager' : 'Create Manager'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}