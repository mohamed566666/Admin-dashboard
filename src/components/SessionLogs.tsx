import React, { useState } from 'react';
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

const mockLogs = [
  { id: '1', user: 'Khaled Samir', action: 'Verification Success', device: 'WS-042', time: '2026-03-16 14:22:10', status: 'success', confidence: 0.98 },
  { id: '2', user: 'Unknown', action: 'Verification Failure', device: 'WS-015', time: '2026-03-16 14:20:05', status: 'error', confidence: 0.42 },
  { id: '3', user: 'Sarah Chen', action: 'Workstation Locked', device: 'WS-088', time: '2026-03-16 14:18:30', status: 'warning', confidence: 0.12 },
  { id: '4', user: 'Marcus Miller', action: 'Verification Success', device: 'WS-022', time: '2026-03-16 14:15:12', status: 'success', confidence: 0.96 },
  { id: '5', user: 'Elena Rodriguez', action: 'Verification Success', device: 'WS-009', time: '2026-03-16 14:12:45', status: 'success', confidence: 0.94 },
  { id: '6', user: 'Unknown', action: 'Unauthorized Access Attempt', device: 'WS-015', time: '2026-03-16 14:10:00', status: 'error', confidence: 0.38 },
  { id: '7', user: 'David Kim', action: 'Verification Success', device: 'WS-031', time: '2026-03-16 14:08:22', status: 'success', confidence: 0.97 },
  { id: '8', user: 'Sarah Chen', action: 'Verification Failure', device: 'WS-088', time: '2026-03-16 14:05:15', status: 'warning', confidence: 0.65 },
];

export default function SessionLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.device.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Active Session Logs</h3>
          <p className="text-sm text-text-secondary">Real-time audit trail of all system verifications</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
            <Calendar className="size-4" />
            Last 24 Hours
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-card border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search by user, action, or device..."
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
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-white/5 bg-white/2">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">User / Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Action Performed</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Workstation</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Confidence</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        log.status === 'success' ? 'bg-success/10 text-success' :
                        log.status === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        <User className="size-4" />
                      </div>
                      <span className="text-sm font-medium">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? <ShieldCheck className="size-4 text-success" /> :
                       log.status === 'warning' ? <Shield className="size-4 text-warning" /> :
                       <ShieldAlert className="size-4 text-error" />}
                      <span className="text-sm">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Monitor className="size-4" />
                      <span className="text-sm font-mono">{log.device}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            log.confidence > 0.8 ? 'bg-success' :
                            log.confidence > 0.5 ? 'bg-warning' :
                            'bg-error'
                          }`}
                          style={{ width: `${log.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-secondary">{(log.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Clock className="size-4" />
                      <span className="text-sm">{log.time.split(' ')[1]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-text-secondary hover:text-accent transition-colors">
                      <ExternalLink className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-white/2 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-text-secondary">
            Showing <span className="text-text-primary font-medium">1</span> to <span className="text-text-primary font-medium">{filteredLogs.length}</span> of <span className="text-text-primary font-medium">124</span> entries
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all">
              <ChevronLeft className="size-4" />
            </button>
            <button className="px-3 py-1 bg-accent text-white rounded-lg text-xs font-bold">1</button>
            <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all">2</button>
            <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all">3</button>
            <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-text-secondary hover:text-text-primary transition-all">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
