import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { employeesService } from '../services/employees';
import { sessionsService } from '../services/sessions';
import { EmployeeResponse, SessionResponse } from '../services/types';
import { useApi } from '../hooks/useApi';

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ title, value, trend, icon: Icon, color }: StatCardProps) => (
  <div className="bg-bg-card border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
        <Icon className="size-6" />
      </div>
      <button className="text-text-secondary hover:text-text-primary transition-colors">
        <MoreHorizontal className="size-5" />
      </button>
    </div>

    <div>
      <p className="text-sm text-text-secondary font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>

    <div className="mt-4 flex items-center gap-2">
      <div className={`flex items-center gap-0.5 text-xs font-bold ${trend > 0 ? 'text-success' : 'text-error'}`}>
        {trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
        {Math.abs(trend)}%
      </div>
      <span className="text-[10px] text-text-secondary uppercase tracking-wider">vs last 24h</span>
    </div>

    <div className={`absolute -right-4 -bottom-4 size-24 bg-${color}/5 blur-3xl rounded-full group-hover:bg-${color}/10 transition-colors`} />
  </div>
);

export default function Dashboard() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeSessions: 0,
    totalWorkedHours: 0,
    onlineUsers: 0,
  });

  const { execute: fetchEmployees } = useApi<EmployeeResponse[]>();
  const { execute: fetchSessions } = useApi<SessionResponse[]>();

  useEffect(() => {
    const loadData = async () => {
      const empResult = await fetchEmployees(employeesService.listEmployees());
      if (empResult.success && empResult.data) {
        setEmployees(empResult.data);
        const totalHours = empResult.data.reduce((sum, emp) => sum + emp.worked_hours, 0);
        const onlineUsers = empResult.data.filter(emp => emp.is_online).length;
        setStats(prev => ({
          ...prev,
          totalEmployees: empResult.data.length,
          totalWorkedHours: totalHours,
          onlineUsers: onlineUsers,
        }));
      }

      const sessionsResult = await fetchSessions(sessionsService.listAllSessions());
      if (sessionsResult.success && sessionsResult.data) {
        setSessions(sessionsResult.data);
        const activeSessions = sessionsResult.data.filter(s => !s.logout_time).length;
        setStats(prev => ({ ...prev, activeSessions }));
      }
    };
    loadData();
  }, []);

  // Mock data for charts (replace with real API data)
  const verificationData = [
    { time: '08:00', total: 120, success: 115 },
    { time: '10:00', total: 450, success: 442 },
    { time: '12:00', total: 820, success: 810 },
    { time: '14:00', total: 680, success: 675 },
    { time: '16:00', total: 950, success: 940 },
    { time: '18:00', total: 420, success: 415 },
    { time: '20:00', total: 150, success: 148 },
  ];

  const securityData = [
    { day: 'Mon', failures: 12 },
    { day: 'Tue', failures: 8 },
    { day: 'Wed', failures: 15 },
    { day: 'Thu', failures: 5 },
    { day: 'Fri', failures: 22 },
    { day: 'Sat', failures: 4 },
    { day: 'Sun', failures: 2 },
  ];

  const successRate = employees.length > 0
    ? ((stats.onlineUsers / employees.length) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees.toString()}
          trend={12.5}
          icon={Users}
          color="accent"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          trend={0.2}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions.toString()}
          trend={-8.4}
          icon={ShieldAlert}
          color="warning"
        />
        <StatCard
          title="Total Hours"
          value={`${Math.round(stats.totalWorkedHours)}h`}
          trend={-4.1}
          icon={Clock}
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-bg-card border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Verification Volume</h3>
              <p className="text-sm text-text-secondary">Real-time system throughput across all nodes</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-bold bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">24H</button>
              <button className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">7D</button>
              <button className="px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">30D</button>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={verificationData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1425',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="success"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart */}
        <div className="bg-bg-card border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Incidents</h3>
              <p className="text-sm text-text-secondary">Weekly security failures</p>
            </div>
            <ArrowUpRight className="size-5 text-text-secondary" />
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={securityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: '#1A1425',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="failures" radius={[4, 4, 0, 0]}>
                  {securityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.failures > 15 ? '#EF4444' : '#F59E0B'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Mini List */}
      <div className="bg-bg-card border border-white/5 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent Sessions</h3>
          <button className="text-accent text-sm font-bold hover:underline">View All Logs</button>
        </div>
        <div className="space-y-4">
          {sessions.slice(0, 4).map((session, i) => {
            const emp = employees.find(e => e.id === session.employee_id);
            const loginTime = new Date(session.login_time);
            const timeAgo = Math.floor((Date.now() - loginTime.getTime()) / 60000);
            const timeText = timeAgo < 1 ? 'Just now' : `${timeAgo} mins ago`;

            return (
              <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`size-2 rounded-full ${!session.logout_time ? 'bg-success' : 'bg-white/30'}`} />
                  <div>
                    <p className="text-sm font-bold">{emp?.name || `Employee #${session.employee_id}`}</p>
                    <p className="text-xs text-text-secondary">
                      {!session.logout_time ? 'Session active' : 'Session ended'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-text-secondary font-mono">{timeText}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}