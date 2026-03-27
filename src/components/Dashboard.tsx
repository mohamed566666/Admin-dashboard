import React from 'react';
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

    {/* Subtle background glow */}
    <div className={`absolute -right-4 -bottom-4 size-24 bg-${color}/5 blur-3xl rounded-full group-hover:bg-${color}/10 transition-colors`} />
  </div>
);

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Users" 
          value="1,284" 
          trend={12.5} 
          icon={Users} 
          color="accent" 
        />
        <StatCard 
          title="Success Rate" 
          value="99.4%" 
          trend={0.2} 
          icon={CheckCircle2} 
          color="success" 
        />
        <StatCard 
          title="Security Alerts" 
          value="24" 
          trend={-8.4} 
          icon={ShieldAlert} 
          color="warning" 
        />
        <StatCard 
          title="Avg. Response" 
          value="142ms" 
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
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
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
          <h3 className="text-xl font-bold">Recent System Events</h3>
          <button className="text-accent text-sm font-bold hover:underline">View All Logs</button>
        </div>
        <div className="space-y-4">
          {[
            { user: 'Sarah Jenkins', event: 'Successful Login', time: '2 mins ago', status: 'success' },
            { user: 'Unknown Device', event: 'Failed Recognition', time: '14 mins ago', status: 'warning' },
            { user: 'Mark Thompson', event: 'Workstation Locked', time: '28 mins ago', status: 'error' },
            { user: 'System', event: 'Threshold Updated', time: '1 hour ago', status: 'accent' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`size-2 rounded-full bg-${item.status}`} />
                <div>
                  <p className="text-sm font-bold">{item.user}</p>
                  <p className="text-xs text-text-secondary">{item.event}</p>
                </div>
              </div>
              <span className="text-xs text-text-secondary font-mono">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
