import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Clock,
  Monitor,
  User,
  RefreshCw,
  Wifi,
  WifiOff,
  Calendar,
  Hourglass,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { sessionsService } from '../services/sessions';
import { employeesService } from '../services/employees';
import { SessionResponse, EmployeeResponse } from '../services/types';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../context/WebSocketContext';
import { motion, AnimatePresence } from 'motion/react';

// Types for filtering and sorting
type SortField = 'employee' | 'login_time' | 'logout_time' | 'duration' | 'status';
type SortOrder = 'asc' | 'desc';
type DateFilterType = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';

export default function SessionLogs({ status }: { status?: string }) {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const itemsPerPage = 10;

  // ✅ Filter and Sort State
  const [sortField, setSortField] = useState<SortField>('login_time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('all');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [minDuration, setMinDuration] = useState<number | null>(null);
  const [maxDuration, setMaxDuration] = useState<number | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const { isConnected, onSessionOpened, onSessionClosed } = useWebSocket();

  const { execute: fetchSessions, loading } = useApi<SessionResponse[]>();
  const { execute: fetchEmployees } = useApi<EmployeeResponse[]>();

  const loadData = useCallback(async () => {
    console.log('[SessionLogs] Loading data...');
    console.log('📡 Fetching employees first...');
    const empResult = await fetchEmployees(employeesService.listEmployees());
    if (empResult.success && empResult.data) {
      console.log('[SessionLogs] Loaded', empResult.data.length, 'employees');
      setEmployees(empResult.data);
      setEmployeesLoaded(true);
    } else {
      console.error('[SessionLogs] Failed to load employees:', empResult.error);
    }

    const sessionsResult = await fetchSessions(sessionsService.listAllSessions());
    if (sessionsResult.success && sessionsResult.data) {
      console.log('[SessionLogs] Loaded', sessionsResult.data.length, 'sessions');
      setSessions(sessionsResult.data);
    } else {
      console.error('[SessionLogs] Failed to load sessions:', sessionsResult.error);
    }
  }, [fetchEmployees, fetchSessions]);

  // Load data once on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket listeners - REAL TIME UPDATES ONLY
  useEffect(() => {
    const unsubscribeOpen = onSessionOpened((data: any) => {
      console.log('🔥🔥🔥 [SessionLogs] REAL-TIME session opened:', data);

      const newSession: SessionResponse = {
        id: data.session_id,
        employee_id: data.employee_id,
        login_time: data.timestamp,
        logout_time: null,
        end_reason: null,
      };

      setSessions(prev => {
        const exists = prev.some(s => s.id === data.session_id);
        if (exists) return prev;
        console.log('[SessionLogs] Adding new session to UI immediately');
        return [newSession, ...prev];
      });
    });

    const unsubscribeClose = onSessionClosed((data: any) => {
      console.log('🔵🔵🔵 [SessionLogs] REAL-TIME session closed:', data);

      setSessions(prev => prev.map(session =>
        session.id === data.session_id
          ? { ...session, logout_time: data.timestamp, end_reason: data.reason }
          : session
      ));
    });

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
    };
  }, [onSessionOpened, onSessionClosed]);

  // Employee names map
  const employeeNamesMap = useMemo(() => {
    const map = new Map<number, string>();
    employees.forEach(emp => {
      if (emp?.id && emp?.name) {
        map.set(emp.id, emp.name);
      }
    });
    return map;
  }, [employees]);

  const getEmployeeName = useCallback((employeeId: number) => {
    if (!employeesLoaded && employees.length === 0) {
      return 'Loading...';
    }
    const name = employeeNamesMap.get(employeeId);
    return name || `Employee #${employeeId}`;
  }, [employeesLoaded, employees.length, employeeNamesMap]);

  const getStatusBadge = (endReason: string | null) => {
    if (!endReason) return { color: 'success', text: 'Active', icon: ShieldCheck };
    switch (endReason?.toLowerCase()) {
      case 'logout': return { color: 'text-secondary', text: 'Completed', icon: ShieldCheck };
      case 'lock': return { color: 'error', text: 'Locked', icon: ShieldAlert };
      case 'go_offline': return { color: 'warning', text: 'Disconnected', icon: Shield };
      default: return { color: 'text-secondary', text: endReason, icon: Shield };
    }
  };

  // ✅ Helper function to get session duration in minutes
  const getSessionDuration = useCallback((session: SessionResponse): number | null => {
    const loginTime = new Date(session.login_time);
    const logoutTime = session.logout_time ? new Date(session.logout_time) : null;
    if (!logoutTime) return null;
    return Math.floor((logoutTime.getTime() - loginTime.getTime()) / 60000);
  }, []);

  // ✅ Helper function to check date filter
  const isWithinDateRange = useCallback((date: Date, filterType: DateFilterType, customRange?: { start: string; end: string }): boolean => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    switch (filterType) {
      case 'today':
        return date >= today;
      case 'yesterday':
        return date >= yesterday && date < today;
      case 'last7days':
        return date >= last7Days;
      case 'last30days':
        return date >= last30Days;
      case 'custom':
        if (customRange?.start && customRange?.end) {
          const startDate = new Date(customRange.start);
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          return date >= startDate && date <= endDate;
        }
        return true;
      default:
        return true;
    }
  }, []);

  // ✅ Enhanced filtering with all criteria
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const empName = getEmployeeName(session.employee_id).toLowerCase();
      const matchesSearch = empName.includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !session.end_reason) ||
        (filterStatus === 'completed' && session.end_reason === 'logout') ||
        (filterStatus === 'locked' && session.end_reason === 'lock') ||
        (filterStatus === 'disconnected' && session.end_reason === 'go_offline');

      // Employee filter (multiple selection)
      const matchesEmployee = selectedEmployees.length === 0 || selectedEmployees.includes(session.employee_id);

      // Date filter
      const loginDate = new Date(session.login_time);
      const matchesDate = isWithinDateRange(loginDate, dateFilterType, customDateRange);

      // Duration filter
      const duration = getSessionDuration(session);
      const matchesDuration =
        (minDuration === null || (duration !== null && duration >= minDuration)) &&
        (maxDuration === null || (duration !== null && duration <= maxDuration));

      return matchesSearch && matchesStatus && matchesEmployee && matchesDate && matchesDuration;
    });
  }, [sessions, searchTerm, filterStatus, selectedEmployees, dateFilterType, customDateRange, minDuration, maxDuration, getEmployeeName, getSessionDuration, isWithinDateRange]);

  // ✅ Sorting
  const sortedAndFilteredSessions = useMemo(() => {
    const sorted = [...filteredSessions];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'employee':
          const nameA = getEmployeeName(a.employee_id);
          const nameB = getEmployeeName(b.employee_id);
          comparison = nameA.localeCompare(nameB);
          break;
        case 'login_time':
          comparison = new Date(a.login_time).getTime() - new Date(b.login_time).getTime();
          break;
        case 'logout_time':
          const logoutA = a.logout_time ? new Date(a.logout_time).getTime() : Infinity;
          const logoutB = b.logout_time ? new Date(b.logout_time).getTime() : Infinity;
          comparison = logoutA - logoutB;
          break;
        case 'duration':
          const durationA = getSessionDuration(a) ?? -1;
          const durationB = getSessionDuration(b) ?? -1;
          comparison = durationA - durationB;
          break;
        case 'status':
          const statusA = a.end_reason || 'active';
          const statusB = b.end_reason || 'active';
          comparison = statusA.localeCompare(statusB);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredSessions, sortField, sortOrder, getEmployeeName, getSessionDuration]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, selectedEmployees, dateFilterType, customDateRange, minDuration, maxDuration, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedAndFilteredSessions.length / itemsPerPage);
  const paginatedSessions = sortedAndFilteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ✅ Toggle sort function
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
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

  // ✅ Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setSelectedEmployees([]);
    setDateFilterType('all');
    setCustomDateRange({ start: '', end: '' });
    setMinDuration(null);
    setMaxDuration(null);
    setSortField('login_time');
    setSortOrder('desc');
    setIsFilterModalOpen(false);
  };

  // ✅ Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filterStatus !== 'all') count++;
    if (selectedEmployees.length > 0) count++;
    if (dateFilterType !== 'all') count++;
    if (minDuration !== null || maxDuration !== null) count++;
    if (sortField !== 'login_time' || sortOrder !== 'desc') count++;
    return count;
  }, [searchTerm, filterStatus, selectedEmployees, dateFilterType, minDuration, maxDuration, sortField, sortOrder]);

  // ✅ Format duration display
  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'Active';
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold tracking-tight">
              {status === 'active' ? 'Active Sessions' : 'Session Logs'}
            </h3>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${isConnected ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
              {isConnected ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
              <span className="font-medium">{isConnected ? 'Live' : 'Reconnecting...'}</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary">
            {status === 'active' ? 'Currently active user sessions' : 'Complete audit trail of all sessions'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-bg-card border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all relative"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 size-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
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
          {filterStatus !== 'all' && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Status: {filterStatus}
              <button onClick={() => setFilterStatus('all')} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          {selectedEmployees.length > 0 && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Employees: {selectedEmployees.length} selected
              <button onClick={() => setSelectedEmployees([])} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          {dateFilterType !== 'all' && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Date: {dateFilterType === 'custom' ? `${customDateRange.start} to ${customDateRange.end}` : dateFilterType}
              <button onClick={() => setDateFilterType('all')} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          {(minDuration !== null || maxDuration !== null) && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Duration: {minDuration !== null ? `${minDuration}+` : ''} {maxDuration !== null ? `≤ ${maxDuration}` : ''} mins
              <button onClick={() => { setMinDuration(null); setMaxDuration(null); }} className="hover:text-accent">
                <X className="size-3" />
              </button>
            </span>
          )}
          {(sortField !== 'login_time' || sortOrder !== 'desc') && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full flex items-center gap-1">
              Sort: {sortField.replace('_', ' ')} ({sortOrder === 'asc' ? '↑' : '↓'})
              <button onClick={() => { setSortField('login_time'); setSortOrder('desc'); }} className="hover:text-accent">
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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="size-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary cursor-pointer hover:text-accent transition-colors"
                    onClick={() => toggleSort('employee')}
                  >
                    <div className="flex items-center">
                      Employee
                      {getSortIcon('employee')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary cursor-pointer hover:text-accent transition-colors"
                    onClick={() => toggleSort('login_time')}
                  >
                    <div className="flex items-center">
                      Login Time
                      {getSortIcon('login_time')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary cursor-pointer hover:text-accent transition-colors"
                    onClick={() => toggleSort('logout_time')}
                  >
                    <div className="flex items-center">
                      Logout Time
                      {getSortIcon('logout_time')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary cursor-pointer hover:text-accent transition-colors"
                    onClick={() => toggleSort('duration')}
                  >
                    <div className="flex items-center">
                      Duration
                      {getSortIcon('duration')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary cursor-pointer hover:text-accent transition-colors"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedSessions.map((session) => {
                  const statusInfo = getStatusBadge(session.end_reason);
                  const loginTime = new Date(session.login_time);
                  const logoutTime = session.logout_time ? new Date(session.logout_time) : null;
                  const duration = getSessionDuration(session);
                  const Icon = statusInfo.icon;

                  return (
                    <tr key={session.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent/10 text-accent">
                            <User className="size-4" />
                          </div>
                          <span className="text-sm font-medium">{getEmployeeName(session.employee_id)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock className="size-4" />
                          <span className="text-sm">{loginTime.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {logoutTime ? logoutTime.toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {formatDuration(duration)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className={`size-4 text-${statusInfo.color}`} />
                          <span className={`text-sm text-${statusInfo.color}`}>{statusInfo.text}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {sortedAndFilteredSessions.length === 0 && (
            <div className="text-center py-12">
              <Monitor className="size-12 text-text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary">No sessions found</p>
              <button onClick={resetFilters} className="mt-4 text-accent text-sm hover:underline">
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-white/2 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-text-secondary">
                Showing <span className="text-text-primary font-medium">{paginatedSessions.length}</span> of <span className="text-text-primary font-medium">{sortedAndFilteredSessions.length}</span> sessions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-accent text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Advanced Filter Modal */}
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
              className="bg-bg-card border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Advanced Filters</h3>
                  <p className="text-sm text-text-secondary mt-1">Filter and sort sessions with multiple criteria</p>
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
                    Session Status
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'active', label: 'Active' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'locked', label: 'Locked' },
                      { value: 'disconnected', label: 'Disconnected' }
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setFilterStatus(status.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === status.value
                          ? 'bg-accent text-white'
                          : 'bg-white/5 text-text-secondary hover:bg-white/10'
                          }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employee Filter (Multi-select) */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
                    Employees
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border border-white/10 rounded-xl p-3">
                    {employees.map(emp => (
                      <label key={emp.id} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, emp.id]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                            }
                          }}
                          className="rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50"
                        />
                        <span className="text-sm">{emp.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {[
                      { value: 'all', label: 'All Time' },
                      { value: 'today', label: 'Today' },
                      { value: 'yesterday', label: 'Yesterday' },
                      { value: 'last7days', label: 'Last 7 Days' },
                      { value: 'last30days', label: 'Last 30 Days' },
                      { value: 'custom', label: 'Custom Range' }
                    ].map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setDateFilterType(range.value as DateFilterType)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${dateFilterType === range.value
                          ? 'bg-accent text-white'
                          : 'bg-white/5 text-text-secondary hover:bg-white/10'
                          }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                  {dateFilterType === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-xs text-text-secondary mb-1 block">Start Date</label>
                        <input
                          type="date"
                          value={customDateRange.start}
                          onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary mb-1 block">End Date</label>
                        <input
                          type="date"
                          value={customDateRange.end}
                          onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Duration Range Filter */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">
                    Duration (minutes)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Min Duration</label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={minDuration === null ? '' : minDuration}
                        onChange={(e) => setMinDuration(e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Min minutes"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary mb-1 block">Max Duration</label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={maxDuration === null ? '' : maxDuration}
                        onChange={(e) => setMaxDuration(e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Max minutes"
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
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
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
                    >
                      <option value="employee">Employee Name</option>
                      <option value="login_time">Login Time</option>
                      <option value="logout_time">Logout Time</option>
                      <option value="duration">Duration</option>
                      <option value="status">Status</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent transition-colors"
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
    </div>
  );
}