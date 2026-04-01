import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  History,
  Shield,
  LogOut,
  Bell,
  Monitor,
  UserPlus,
  Activity,
  Lock,
  Search,
  HelpCircle,
  Building2,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Login from './components/Login';
import { ThemeToggle } from './context/ThemeContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { useAuth } from './hooks/useAuth';
import Cookies from 'js-cookie';

// Components
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import Configuration from './components/Configuration';
import SessionLogs from './components/SessionLogs';
import ClientSimulator from './components/ClientSimulator';
import Managers from './components/Managers';
import Departments from './components/Departments';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'dashboard' | 'users' | 'managers' | 'departments' | 'enroll' | 'config' | 'active' | 'locks' | 'analytics' | 'settings' | 'simulator';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({ username: '', role: '' });
  const [isLoading, setIsLoading] = useState(true);

  const { logout, getCurrentUsername, getCurrentRole, getManagerId } = useAuth();

  useEffect(() => {
    const token = Cookies.get('access_token');
    console.log('[App] Checking auth, token exists:', !!token);
    console.log('[App] localStorage before:', {
      manager_id: localStorage.getItem('manager_id'),
      username: localStorage.getItem('username')
    });

    if (token) {
      // Make sure manager_id is set
      let managerId = getManagerId();
      if (!managerId) {
        console.log('[App] Setting default manager_id to 1');
        localStorage.setItem('manager_id', '1');
        managerId = 1;
      }

      console.log('[App] Setting authenticated with manager_id:', managerId);
      setIsAuthenticated(true);
      setCurrentUser({
        username: getCurrentUsername() || 'User',
        role: getCurrentRole() || 'Admin',
      });
    } else {
      console.log('[App] No token, not authenticated');
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [getCurrentUsername, getCurrentRole, getManagerId]);

  const handleLogin = (username: string, password: string) => {
    console.log('[App] Login successful:', username);
    setIsAuthenticated(true);
    setCurrentUser({
      username: username,
      role: 'admin',
    });
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="size-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Employees', icon: Users },
    { id: 'managers', label: 'Managers', icon: Shield },
    { id: 'departments', label: 'Departments', icon: Building2 },
    // { id: 'enroll', label: 'User Enrollment', icon: UserPlus },
    // { id: 'config', label: 'Configurations', icon: Settings },
    { id: 'active', label: 'Sessions', icon: Activity },
    // { id: 'locks', label: 'Lock Screen Events', icon: Lock },
    { id: 'analytics', label: 'Analytics', icon: History },
    { id: 'simulator', label: 'Client Simulator', icon: Monitor },
  ];

  return (
    <div className="flex h-screen bg-bg-deep text-text-primary font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-bg-sidebar border-r border-white/5 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <Shield className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-lg leading-none">SecureFace</h1>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">Enterprise Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-xl cursor-pointer group",
                activeTab === item.id
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              )}
            >
              <item.icon className={cn("size-5", activeTab === item.id ? "text-white" : "text-text-secondary group-hover:text-text-primary")} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-xl cursor-pointer group",
                activeTab === 'settings'
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              )}
            >
              <Settings className="size-5" />
              <span className="font-medium">Configuration Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5">
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="size-10 bg-bg-card rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                alt="Profile"
                className="size-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{currentUser.username}</p>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider capitalize">
                {currentUser.role}
              </p>
            </div>
            <LogOut className="size-4 text-text-secondary group-hover:text-error transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-bg-deep/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {navItems.find(i => i.id === activeTab)?.label || 'System Settings'}
            </h2>
            {activeTab === 'dashboard' && (
              <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest rounded">
                System Live
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search system logs..."
                className="w-full pl-10 pr-4 py-2 bg-bg-card/50 border border-white/5 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <ThemeToggle />
            <button className="p-2.5 bg-bg-card border border-white/5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer relative">
              <Bell className="size-5 text-text-secondary" />
              <span className="absolute top-2 right-2 size-2 bg-accent rounded-full border-2 border-bg-card" />
            </button>
            <button className="p-2.5 bg-bg-card border border-white/5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <HelpCircle className="size-5 text-text-secondary" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'managers' && <Managers />}
          {activeTab === 'departments' && <Departments />}
          {/* {activeTab === 'enroll' && <UserManagement initialView="enroll" />} */}
          {activeTab === 'config' && <Configuration />}
          {activeTab === 'active' && <SessionLogs status="active" />}
          {/* {activeTab === 'locks' && <SessionLogs status="locked" />} */}
          {activeTab === 'analytics' && <Dashboard />}
          {activeTab === 'simulator' && <ClientSimulator />}
          {activeTab === 'settings' && <Configuration />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <WebSocketProvider>
      <AppContent />
    </WebSocketProvider>
  );
}