import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Minus,
  Save,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { employeesService } from '../services/employees';
import { departmentsService } from '../services/departments';
import { EmployeeResponse, DepartmentResponse, PaginatedResponse } from '../services/types';
import { useApi } from '../hooks/useApi';

// ✅ Types for filtering and sorting
type SortField = 'name' | 'username' | 'department' | 'worked_hours' | 'status';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'online' | 'offline';

export default function UserManagement({ initialView }: { initialView?: string }) {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [departmentsLoaded, setDepartmentsLoaded] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 5,
    total: 0,
    totalPages: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(initialView === 'enroll');
  const [enrollStep, setEnrollStep] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    department_id: '',
  });

  // ✅ Filter and Sort State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [departmentFilter, setDepartmentFilter] = useState<number | 'all'>('all');
  const [hoursRange, setHoursRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });

  // ✅ Edit modal state
  const [editMode, setEditMode] = useState<'add' | 'set' | 'reset'>('add');
  const [editHoursValue, setEditHoursValue] = useState<number>(0);

  const { execute: fetchEmployees, loading: loadingList } = useApi<PaginatedResponse<EmployeeResponse>>();
  const { execute: fetchDepartments } = useApi<DepartmentResponse[]>();
  const { execute: registerEmployee, loading: registering } = useApi<any>();
  const { execute: deleteEmployee, loading: deleting } = useApi<void>();
  const { execute: addWorkedHours, loading: updatingHours } = useApi<EmployeeResponse>();
  const { execute: setWorkedHours, loading: settingHours } = useApi<EmployeeResponse>();
  const { execute: resetWorkedHours, loading: resettingHours } = useApi<EmployeeResponse>();

  const loadData = async () => {
    console.log('👥 [UserManagement] === Loading Data ===');

    const deptsResult = await fetchDepartments(departmentsService.listDepartments());
    if (deptsResult.success && deptsResult.data) {
      console.log('✅ Departments loaded:', deptsResult.data.length);
      setDepartments(deptsResult.data);
      setDepartmentsLoaded(true);
    }

    const result = await fetchEmployees(
      employeesService.listEmployeesPaginated(pagination.page, pagination.pageSize)
    );
    if (result.success && result.data) {
      console.log('✅ Employees loaded:', result.data.data.length);
      setEmployees(result.data.data);
      setPagination(prev => ({
        ...prev,
        total: result.data!.total,
        totalPages: result.data!.total_pages,
      }));
    } else {
      console.error('❌ Failed to load employees:', result.error);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.page, pagination.pageSize]);

  const departmentNamesMap = useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach(dept => {
      if (dept?.id && dept?.name) {
        map.set(dept.id, dept.name);
      }
    });
    return map;
  }, [departments]);

  const getDepartmentName = (deptId: number | null | undefined) => {
    if (!deptId) return 'No Department';
    if (!departmentsLoaded && departments.length === 0) {
      return 'Loading...';
    }
    const name = departmentNamesMap.get(deptId);
    return name || 'Unknown';
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-success/10 text-success' : 'bg-white/5 text-text-secondary';
  };

  // ✅ Enhanced filtering with all criteria
  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = [...employees];

    // 1. Search term filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Status filter (online/offline)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp =>
        statusFilter === 'online' ? emp.is_online : !emp.is_online
      );
    }

    // 3. Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department_id === departmentFilter);
    }

    // 4. Hours range filter
    filtered = filtered.filter(emp =>
      emp.worked_hours >= hoursRange.min &&
      emp.worked_hours <= hoursRange.max
    );

    // 5. Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'username':
          comparison = a.username.localeCompare(b.username);
          break;
        case 'department':
          const deptA = getDepartmentName(a.department_id);
          const deptB = getDepartmentName(b.department_id);
          comparison = deptA.localeCompare(deptB);
          break;
        case 'worked_hours':
          comparison = a.worked_hours - b.worked_hours;
          break;
        case 'status':
          comparison = (a.is_online === b.is_online) ? 0 : a.is_online ? 1 : -1;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [employees, searchTerm, statusFilter, departmentFilter, hoursRange, sortField, sortOrder, departmentsLoaded, departments]);

  // ✅ Toggle sort function
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ✅ Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setHoursRange({ min: 0, max: Infinity });
    setSortField('name');
    setSortOrder('asc');
    setIsFilterModalOpen(false);
  };

  // ✅ Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="size-3 ml-1 opacity-50" />;
    }
    return sortOrder === 'asc' ?
      <ArrowUp className="size-3 ml-1" /> :
      <ArrowDown className="size-3 ml-1" />;
  };

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

  const handleEditClick = (employee: EmployeeResponse) => {
    setSelectedEmployee(employee);
    setEditMode('add');
    setEditHoursValue(0);
    setIsEditModalOpen(true);
  };

  const handleUpdateHours = async () => {
    if (!selectedEmployee) return;

    let result;
    if (editMode === 'add') {
      if (editHoursValue <= 0) {
        alert('Please enter hours greater than 0');
        return;
      }
      result = await addWorkedHours(
        employeesService.addWorkedHours(selectedEmployee.id, editHoursValue)
      );
    } else if (editMode === 'set') {
      if (editHoursValue < 0) {
        alert('Hours cannot be negative');
        return;
      }
      result = await setWorkedHours(
        employeesService.setWorkedHours(selectedEmployee.id, editHoursValue)
      );
    } else {
      result = await resetWorkedHours(
        employeesService.resetWorkedHours(selectedEmployee.id)
      );
    }

    if (result.success) {
      await loadData();
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    } else {
      alert(result.error);
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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  const changePageSize = (newSize: number) => {
    setPagination({ page: 1, pageSize: newSize, total: pagination.total, totalPages: pagination.totalPages });
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
        <div className="text-xs text-text-secondary">
          Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
        </div>
        <div className="flex items-center gap-2">
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
            <button onClick={() => goToPage(1)} disabled={pagination.page === 1} className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsLeft className="size-4" /></button>
            <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="size-4" /></button>
            {start > 1 && (<><button onClick={() => goToPage(1)} className="size-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-sm">1</button>{start > 2 && <span className="px-2 text-text-secondary">...</span>}</>)}
            {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
              <button key={page} onClick={() => goToPage(page)} className={`size-8 flex items-center justify-center rounded-lg transition-colors text-sm font-medium ${page === pagination.page ? 'bg-accent text-white' : 'hover:bg-white/5'}`}>{page}</button>
            ))}
            {end < pagination.totalPages && (<>{end < pagination.totalPages - 1 && <span className="px-2 text-text-secondary">...</span>}<button onClick={() => goToPage(pagination.totalPages)} className="size-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-sm">{pagination.totalPages}</button></>)}
            <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="size-4" /></button>
            <button onClick={() => goToPage(pagination.totalPages)} disabled={pagination.page === pagination.totalPages} className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronsRight className="size-4" /></button>
          </div>
        </div>
      </div>
    );
  };

  const renderEnrollStep = () => {
    switch (enrollStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Full Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" /></div>
              <div><label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Username *</label><input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="e.g. john_doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors" /></div>
              {departments.length > 0 && (<div><label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Department (Optional)</label><select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"><option value="" className="text-text-secondary">-- Select a department --</option>{departments.map(dept => (<option key={dept.id} value={dept.id.toString()} className="text-text-primary">{dept.name}</option>))}</select>{departments.length === 0 && (<p className="text-xs text-warning mt-1">No departments available. Please add departments first.</p>)}</div>)}
            </div>
            <button onClick={() => setEnrollStep(2)} disabled={!formData.name || !formData.username} className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50">Continue to Face Capture</button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-2xl relative overflow-hidden border border-white/10">
              {selectedPhoto ? (<img src={URL.createObjectURL(selectedPhoto)} alt="Preview" className="w-full h-full object-cover" />) : (<div className="absolute inset-0 flex items-center justify-center"><Camera className="size-12 text-white/20" /></div>)}
              <div className="absolute inset-0 border-2 border-accent/30 m-8 rounded-lg"><div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-accent" /><div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-accent" /><div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-accent" /><div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-accent" /></div>
            </div>
            <input type="file" accept="image/*" onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20" />
            <div className="text-center"><p className="text-sm text-text-secondary">Position your face within the frame and upload a clear photo.</p></div>
            <button onClick={handleRegister} disabled={!selectedPhoto || registering} className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50">{registering ? 'Registering...' : 'Register Employee'}</button>
          </div>
        );
      case 3:
        return (<div className="py-12 flex flex-col items-center justify-center space-y-6"><div className="relative"><Loader2 className="size-16 text-accent animate-spin" /><Shield className="size-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div><div className="text-center"><h4 className="text-xl font-bold mb-2">Generating Embeddings</h4><p className="text-sm text-text-secondary">Extracting facial features and creating secure hash...</p></div></div>);
      case 4:
        return (<div className="py-12 flex flex-col items-center justify-center space-y-6"><div className="size-20 bg-success/10 rounded-full flex items-center justify-center"><CheckCircle2 className="size-10 text-success" /></div><div className="text-center"><h4 className="text-2xl font-bold mb-2">Enrollment Complete</h4><p className="text-sm text-text-secondary">Employee has been successfully added to the secure database.</p></div></div>);
    }
  };

  const isLoading = updatingHours || settingHours || resettingHours;

  // ✅ Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== 'all') count++;
    if (departmentFilter !== 'all') count++;
    if (hoursRange.min > 0 || hoursRange.max !== Infinity) count++;
    if (sortField !== 'name' || sortOrder !== 'asc') count++;
    return count;
  }, [searchTerm, statusFilter, departmentFilter, hoursRange, sortField, sortOrder]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Search and Actions */}
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
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-bg-card border border-white/5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors relative"
          >
            <SlidersHorizontal className="size-4" />
            Filter
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsEnrollModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
            <UserPlus className="size-4" />
            Enroll Employee
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-secondary">Active filters:</span>
          {searchTerm && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Search: {searchTerm}
              <button onClick={() => setSearchTerm('')} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Status: {statusFilter === 'online' ? 'Online' : 'Offline'}
              <button onClick={() => setStatusFilter('all')} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          {departmentFilter !== 'all' && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Dept: {departments.find(d => d.id === departmentFilter)?.name || 'Unknown'}
              <button onClick={() => setDepartmentFilter('all')} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          {(hoursRange.min > 0 || hoursRange.max !== Infinity) && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Hours: {hoursRange.min > 0 ? `${hoursRange.min}+` : ''} {hoursRange.max !== Infinity ? `≤ ${hoursRange.max}` : ''}
              <button onClick={() => setHoursRange({ min: 0, max: Infinity })} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          {(sortField !== 'name' || sortOrder !== 'asc') && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Sort: {sortField.replace('_', ' ')} ({sortOrder === 'asc' ? '↑' : '↓'})
              <button onClick={() => { setSortField('name'); setSortOrder('asc'); }} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          <button onClick={resetFilters} className="text-xs text-error hover:text-error/80">
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
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
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('name')}>
                    <div className="flex items-center">
                      Employee
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('username')}>
                    <div className="flex items-center">
                      Username
                      {getSortIcon('username')}
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('department')}>
                    <div className="flex items-center">
                      Department
                      {getSortIcon('department')}
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('worked_hours')}>
                    <div className="flex items-center">
                      Worked Hours
                      {getSortIcon('worked_hours')}
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest cursor-pointer hover:text-accent transition-colors" onClick={() => toggleSort('status')}>
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSortedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{emp.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm">{emp.username}</td>
                    <td className="px-6 py-5 text-sm">{getDepartmentName(emp.department_id)}</td>
                    <td className="px-6 py-5 text-sm font-medium">{emp.worked_hours} hrs</td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${getStatusColor(emp.is_online)}`}>
                        {emp.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(emp)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-accent">
                          <Edit2 className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(emp.id, emp.name)} disabled={deleting} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-error">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAndSortedEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="size-12 text-text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary">No employees found matching the filters</p>
              <button onClick={resetFilters} className="mt-4 text-accent text-sm hover:underline">
                Clear all filters
              </button>
            </div>
          )}
          {renderPagination()}
        </div>
      )}

      {/* ✅ Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-bg-card border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Filter & Sort</h3>
                  <p className="text-sm text-text-secondary mt-1">Customize how employees are displayed</p>
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="size-6 text-text-secondary" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
                    Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['all', 'online', 'offline'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                            ? 'bg-accent text-white'
                            : 'bg-white/5 text-text-secondary hover:bg-white/10'
                          }`}
                      >
                        {status === 'all' ? 'All' : status === 'online' ? 'Online' : 'Offline'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
                    Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Hours Range Filter */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
                    Worked Hours Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Min Hours</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={hoursRange.min === 0 ? '' : hoursRange.min}
                        onChange={(e) => setHoursRange(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                        placeholder="Min"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Max Hours</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={hoursRange.max === Infinity ? '' : hoursRange.max}
                        onChange={(e) => setHoursRange(prev => ({ ...prev, max: parseFloat(e.target.value) || Infinity }))}
                        placeholder="Max"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
                    Sort By
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                    >
                      <option value="name">Name</option>
                      <option value="username">Username</option>
                      <option value="department">Department</option>
                      <option value="worked_hours">Worked Hours</option>
                      <option value="status">Status</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                    >
                      <option value="asc">Ascending ↑</option>
                      <option value="desc">Descending ↓</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-bg-card border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Manage Worked Hours</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {selectedEmployee.name} (@{selectedEmployee.username})
                  </p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="size-6 text-text-secondary" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                  <div className="text-center">
                    <p className="text-sm text-text-secondary mb-1">Current Worked Hours</p>
                    <p className="text-3xl font-bold text-accent">{selectedEmployee.worked_hours} hrs</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setEditMode('add')}
                    className={`p-3 rounded-xl border transition-all ${editMode === 'add'
                      ? 'bg-accent border-accent text-white'
                      : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
                      }`}
                  >
                    <Plus className="size-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Add Hours</span>
                  </button>
                  <button
                    onClick={() => setEditMode('set')}
                    className={`p-3 rounded-xl border transition-all ${editMode === 'set'
                      ? 'bg-accent border-accent text-white'
                      : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
                      }`}
                  >
                    <Save className="size-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Set Hours</span>
                  </button>
                  <button
                    onClick={() => setEditMode('reset')}
                    className={`p-3 rounded-xl border transition-all ${editMode === 'reset'
                      ? 'bg-error border-error text-white'
                      : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
                      }`}
                  >
                    <Trash2 className="size-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Reset</span>
                  </button>
                </div>

                {editMode !== 'reset' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">
                      {editMode === 'add' ? 'Hours to Add' : 'Set Hours'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min={editMode === 'add' ? 0.5 : 0}
                        value={editHoursValue}
                        onChange={(e) => setEditHoursValue(parseFloat(e.target.value) || 0)}
                        placeholder={editMode === 'add' ? 'e.g., 8.5' : 'e.g., 40'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors pr-16"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">hours</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateHours}
                    disabled={isLoading || (editMode !== 'reset' && editHoursValue <= 0 && editMode === 'add')}
                    className="flex-1 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      editMode === 'reset' ? 'Reset Hours' : 'Update Hours'
                    )}
                  </button>
                </div>

                {editMode === 'reset' && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                    <p className="text-xs text-error text-center">
                      ⚠️ Warning: This will reset all worked hours to 0. This action cannot be undone.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enroll Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEnrollModalOpen(false)} className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-bg-card border border-white/10 w-full max-w-xl rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between"><div><h3 className="text-2xl font-bold tracking-tight">Employee Enrollment</h3><p className="text-sm text-text-secondary">Step {enrollStep} of 4</p></div><button onClick={() => setIsEnrollModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="size-6 text-text-secondary" /></button></div>
              <div className="p-8"><div className="flex gap-2 mb-8">{[1, 2, 3, 4].map((step) => (<div key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= enrollStep ? 'bg-accent' : 'bg-white/10'}`} />))}</div>{renderEnrollStep()}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}