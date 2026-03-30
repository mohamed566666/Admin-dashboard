import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Camera,
  CheckCircle2,
  X,
  Loader2,
  Filter,
  Download,
  Trash2,
  Edit2,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { employeesService } from '../services/employees';
import { departmentsService } from '../services/departments';
import { EmployeeResponse, DepartmentResponse } from '../services/types';
import { useApi } from '../hooks/useApi';

export default function UserManagement({ initialView }: { initialView?: string }) {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(initialView === 'enroll');
  const [enrollStep, setEnrollStep] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    department_id: '',
  });

  const { execute: fetchEmployees, loading: loadingList } = useApi<EmployeeResponse[]>();
  const { execute: fetchDepartments } = useApi<DepartmentResponse[]>();
  const { execute: registerEmployee, loading: registering } = useApi<any>();
  const { execute: deleteEmployee, loading: deleting } = useApi<void>();

  const loadData = async () => {
    const result = await fetchEmployees(employeesService.listEmployees());
    if (result.success && result.data) {
      setEmployees(result.data);
    }

    const deptsResult = await fetchDepartments(departmentsService.listDepartments());
    if (deptsResult.success && deptsResult.data) {
      setDepartments(deptsResult.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (employeeId: number, name: string) => {
    if (confirm(`Are you sure you want to delete employee "${name}"?`)) {
      const result = await deleteEmployee(employeesService.deleteEmployee(employeeId));
      if (result.success) {
        await loadData();
      } else {
        alert(result.error);
      }
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.username) {
      alert('Please fill all fields');
      return;
    }

    if (!selectedPhoto && enrollStep === 2) {
      alert('Please select a photo');
      return;
    }

    if (enrollStep === 2 && selectedPhoto) {
      const deptId = formData.department_id ? parseInt(formData.department_id) : null;

      const result = await registerEmployee(
        employeesService.registerWithPhoto(formData.name, formData.username, selectedPhoto, deptId)
      );

      if (result.success) {
        setEnrollStep(3);
        setTimeout(() => {
          setEnrollStep(4);
          setTimeout(() => {
            setIsEnrollModalOpen(false);
            setEnrollStep(1);
            setFormData({ name: '', username: '', department_id: '' });
            setSelectedPhoto(null);
            loadData();
          }, 2000);
        }, 2000);
      } else {
        alert(result.error);
      }
    }
  };

  const getDepartmentName = (deptId: number | null) => {
    if (!deptId) return 'No Department';
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || 'Unknown';
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-success/10 text-success' : 'bg-white/5 text-text-secondary';
  };

  const renderEnrollStep = () => {
    switch (enrollStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. john_doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Department Selection */}
              {departments.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">
                    Department (Optional)
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%239CA3AF\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
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
                    <p className="text-xs text-warning mt-1">
                      No departments available. Please add departments first.
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setEnrollStep(2)}
              disabled={!formData.name || !formData.username}
              className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              Continue to Face Capture
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-2xl relative overflow-hidden border border-white/10">
              {selectedPhoto ? (
                <img
                  src={URL.createObjectURL(selectedPhoto)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="size-12 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 border-2 border-accent/30 m-8 rounded-lg">
                <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-accent" />
                <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-accent" />
                <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-accent" />
                <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-accent" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
              className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
            />
            <div className="text-center">
              <p className="text-sm text-text-secondary">Position your face within the frame and upload a clear photo.</p>
            </div>
            <button
              onClick={handleRegister}
              disabled={!selectedPhoto || registering}
              className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50"
            >
              {registering ? 'Registering...' : 'Register Employee'}
            </button>
          </div>
        );
      case 3:
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Loader2 className="size-16 text-accent animate-spin" />
              <Shield className="size-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold mb-2">Generating Embeddings</h4>
              <p className="text-sm text-text-secondary">Extracting facial features and creating secure hash...</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="py-12 flex flex-col items-center justify-center space-y-6">
            <div className="size-20 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="size-10 text-success" />
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-2">Enrollment Complete</h4>
              <p className="text-sm text-text-secondary">Employee has been successfully added to the secure database.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-bg-card border border-white/5 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-bg-card border border-white/5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors">
            <Filter className="size-4" />
            Filter
          </button>
          {/* <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-bg-card border border-white/5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors">
            <Download className="size-4" />
            Export
          </button> */}
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
          >
            <UserPlus className="size-4" />
            Enroll Employee
          </button>
        </div>
      </div>

      {/* Employees Table */}
      {loadingList ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Username</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Department</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Worked Hours</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
                  {/* <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Created</th> */}
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{emp.name}</p>
                          {/* <p className="text-[10px] text-text-secondary">ID: {emp.id}</p> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm">{emp.username}</td>
                    <td className="px-6 py-5 text-sm">{getDepartmentName(emp.department_id)}</td>
                    <td className="px-6 py-5 text-sm">{emp.worked_hours} hrs</td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${getStatusColor(emp.is_online)}`}>
                        {emp.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    {/* <td className="px-6 py-5 text-sm">{new Date(emp.created_at).toLocaleDateString()}</td> */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-accent">
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
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

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="size-12 text-text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary">No employees found</p>
            </div>
          )}
        </div>
      )}

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-bg-card border border-white/10 w-full max-w-xl rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Employee Enrollment</h3>
                  <p className="text-sm text-text-secondary">Step {enrollStep} of 4</p>
                </div>
                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="size-6 text-text-secondary" />
                </button>
              </div>

              <div className="p-8">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= enrollStep ? 'bg-accent' : 'bg-white/10'
                        }`}
                    />
                  ))}
                </div>

                {renderEnrollStep()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}