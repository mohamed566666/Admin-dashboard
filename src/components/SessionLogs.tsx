import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Clock,
  Monitor,
  User,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { sessionsService } from '../services/sessions';
import { employeesService } from '../services/employees';
import { SessionResponse, EmployeeResponse } from '../services/types';
import { useApi } from '../hooks/useApi';

export default function SessionLogs({ status }: { status?: string }) {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { execute: fetchSessions, loading } = useApi<SessionResponse[]>();
  const { execute: fetchEmployees } = useApi<EmployeeResponse[]>();

  const loadData = async () => {
    const sessionsResult = await fetchSessions(sessionsService.listAllSessions());
    if (sessionsResult.success && sessionsResult.data) {
      setSessions(sessionsResult.data);
    }

    const empResult = await fetchEmployees(employeesService.listEmployees());
    if (empResult.success && empResult.data) {
      setEmployees(empResult.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeName = (employeeId: number) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp?.name || `Employee #${employeeId}`;
  };

  const getStatusBadge = (endReason: string | null) => {
    if (!endReason) {
      return { color: 'success', text: 'Active', icon: ShieldCheck };
    }

    switch (endReason.toLowerCase()) {
      case 'logout':
        return { color: 'text-secondary', text: 'Completed', icon: ShieldCheck };

      case 'lock':
        return { color: 'error', text: 'Locked', icon: ShieldAlert };

      case 'go_offline':
        return { color: 'warning', text: 'Disconnected', icon: Shield };

      default:
        return { color: 'text-secondary', text: 'Unknown', icon: Shield };
    }
  };

  const filteredSessions = sessions.filter(session => {
    const empName = getEmployeeName(session.employee_id).toLowerCase();
    const matchesSearch = empName.includes(searchTerm.toLowerCase());
    const statusBadge = getStatusBadge(session.end_reason);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !session.end_reason) ||
      (filterStatus === 'completed' && session.end_reason === 'logout') ||
      (filterStatus === 'locked' && session.end_reason === 'lock') ||
      (filterStatus === 'disconnected' && session.end_reason === 'go_offline');
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">
            {status === 'active' ? 'Active Sessions' : 'Session Logs'}
          </h3>
          <p className="text-sm text-text-secondary">
            {status === 'active' ? 'Currently active user sessions' : 'Complete audit trail of all sessions'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
            <Calendar className="size-4" />
            Last 24 Hours
          </button>
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
            <Download className="size-4" />
            Export CSV
          </button> */}
        </div>
      </div>

      {/* Filters */}
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
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-text-secondary ml-2" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-all cursor-pointer"
          >
            <option value="all">All Sessions</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="locked">Locked</option>
            <option value="disconnected">Disconnected</option>
          </select>
        </div>
      </div>

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
                <tr className="border-bottom border-white/5 bg-white/2">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Login Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Logout Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Duration</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Status</th>
                  {/* <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-right">Session ID</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedSessions.map((session) => {
                  const statusInfo = getStatusBadge(session.end_reason);
                  const loginTime = new Date(session.login_time);
                  const logoutTime = session.logout_time ? new Date(session.logout_time) : null;
                  const duration = logoutTime
                    ? `${Math.floor((logoutTime.getTime() - loginTime.getTime()) / 60000)} mins`
                    : 'Active';
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
                      <td className="px-6 py-4 text-sm font-mono">{duration}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className={`size-4 text-${statusInfo.color}`} />
                          <span className={`text-sm text-${statusInfo.color}`}>{statusInfo.text}</span>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 text-right">
                        <span className="text-xs font-mono text-text-secondary">{session.id.slice(0, 8)}...</span>
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <Monitor className="size-12 text-text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary">No sessions found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-white/2 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-text-secondary">
                Showing <span className="text-text-primary font-medium">{paginatedSessions.length}</span> of <span className="text-text-primary font-medium">{filteredSessions.length}</span> sessions
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
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                        ? 'bg-accent text-white'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
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
    </div>
  );
}