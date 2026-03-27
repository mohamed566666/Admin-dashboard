import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const mockUsers = [
  { id: '1', name: 'Sarah Jenkins', windowsId: 'S-1-5-21-36238', enrolled: '2024-02-12', status: 'Active', security: 'High' },
  { id: '2', name: 'Mark Thompson', windowsId: 'S-1-5-21-92837', enrolled: '2024-01-28', status: 'Active', security: 'Medium' },
  { id: '3', name: 'Elena Rodriguez', windowsId: 'S-1-5-21-10293', enrolled: '2024-03-05', status: 'Pending', security: 'High' },
  { id: '4', name: 'David Chen', windowsId: 'S-1-5-21-48572', enrolled: '2024-02-20', status: 'Active', security: 'Low' },
  { id: '5', name: 'James Wilson', windowsId: 'S-1-5-21-55667', enrolled: '2023-12-15', status: 'Inactive', security: 'High' },
];

export default function UserManagement({ initialView }: { initialView?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(initialView === 'enroll');
  const [enrollStep, setEnrollStep] = useState(1);

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.windowsId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderEnrollStep = () => {
    switch(enrollStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Windows SID</label>
                <input 
                  type="text" 
                  placeholder="e.g. S-1-5-21-..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            <button 
              onClick={() => setEnrollStep(2)}
              className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
            >
              Continue to Face Capture
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-2xl relative overflow-hidden border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="size-12 text-white/20" />
              </div>
              {/* Simulated Scanning UI */}
              <div className="absolute inset-0 border-2 border-accent/30 m-8 rounded-lg">
                <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-accent" />
                <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-accent" />
                <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-accent" />
                <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-accent" />
                <motion.div 
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-accent/50 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary">Position your face within the frame and look directly at the camera.</p>
            </div>
            <button 
              onClick={() => setEnrollStep(3)}
              className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all"
            >
              Capture Face
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
            {setTimeout(() => setEnrollStep(4), 2000) && null}
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
              <p className="text-sm text-text-secondary">User has been successfully added to the secure database.</p>
            </div>
            <button 
              onClick={() => {
                setIsEnrollModalOpen(false);
                setEnrollStep(1);
              }}
              className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Close
            </button>
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
            placeholder="Search by name or ID..."
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
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-bg-card border border-white/5 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors">
            <Download className="size-4" />
            Export
          </button>
          <button 
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
          >
            <UserPlus className="size-4" />
            Enroll User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">User</th>
              <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Windows ID</th>
              <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Enrolled</th>
              <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {user.security === 'High' ? <ShieldCheck className="size-3 text-success" /> : 
                         user.security === 'Medium' ? <Shield className="size-3 text-warning" /> : 
                         <ShieldAlert className="size-3 text-error" />}
                        <span className="text-[10px] text-text-secondary uppercase tracking-wider">{user.security} Security</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-mono text-xs text-text-secondary">{user.windowsId}</td>
                <td className="px-6 py-5 text-sm">{user.enrolled}</td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                    user.status === 'Active' ? 'bg-success/10 text-success' :
                    user.status === 'Pending' ? 'bg-warning/10 text-warning' :
                    'bg-white/5 text-text-secondary'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-text-primary">
                    <MoreVertical className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  <h3 className="text-2xl font-bold tracking-tight">User Enrollment</h3>
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
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        step <= enrollStep ? 'bg-accent' : 'bg-white/10'
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
