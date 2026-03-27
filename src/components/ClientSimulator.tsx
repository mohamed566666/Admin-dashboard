import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock,
  User,
  Zap,
  AlertTriangle,
  RefreshCw,
  Eye,
  Camera,
  Settings2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ClientSimulator() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'authorized' | 'denied' | 'locked'>('idle');
  const [confidence, setConfidence] = useState(0);
  const [lockCounter, setLockCounter] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const simulateScan = () => {
    if (status === 'locked') return;
    
    setStatus('scanning');
    addLog('Initiating biometric scan...');
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;
      const conf = isSuccess ? 0.85 + Math.random() * 0.1 : 0.2 + Math.random() * 0.3;
      
      setConfidence(conf);
      
      if (isSuccess) {
        setStatus('authorized');
        setLockCounter(0);
        addLog(`Verification success: ${(conf * 100).toFixed(1)}% confidence`);
      } else {
        setStatus('denied');
        const newCounter = lockCounter + 1;
        setLockCounter(newCounter);
        addLog(`Verification failure: ${(conf * 100).toFixed(1)}% confidence`);
        
        if (newCounter >= 3) {
          setStatus('locked');
          addLog('CRITICAL: Workstation locked due to repeated failures');
        }
      }
    }, 1500);
  };

  const handleUnlock = () => {
    setStatus('idle');
    setLockCounter(0);
    setConfidence(0);
    addLog('Administrator override: System unlocked');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Client Endpoint Simulator</h3>
          <p className="text-sm text-text-secondary">Simulate on-device detection and security responses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <div className={`size-2 rounded-full ${status === 'locked' ? 'bg-error animate-pulse' : 'bg-success'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Endpoint: WS-042</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulator View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
            {/* Camera Feed Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/40 via-transparent to-transparent" />
              <User className="size-32 text-white/5" />
            </div>

            {/* Scanning Overlay */}
            <AnimatePresence>
              {status === 'scanning' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10"
                >
                  <div className="absolute inset-0 border-2 border-accent/30 m-8 rounded-2xl" />
                  <motion.div 
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-8 right-8 h-0.5 bg-accent shadow-[0_0_15px_rgba(124,58,237,0.8)] z-20"
                  />
                  <div className="absolute inset-0 bg-accent/5" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Overlays */}
            <AnimatePresence mode="wait">
              {status === 'locked' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-30 bg-error/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center"
                >
                  <Lock className="size-20 mb-6" />
                  <h4 className="text-3xl font-bold mb-2">WORKSTATION LOCKED</h4>
                  <p className="text-white/70 max-w-xs mb-8">This device has been secured due to unauthorized access attempts.</p>
                  <button 
                    onClick={handleUnlock}
                    className="px-8 py-3 bg-white text-error rounded-xl font-bold hover:bg-white/90 transition-all shadow-xl"
                  >
                    Administrator Unlock
                  </button>
                </motion.div>
              )}

              {status === 'authorized' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-success/20 backdrop-blur-md border border-success/30 px-6 py-3 rounded-2xl flex items-center gap-3"
                >
                  <ShieldCheck className="size-5 text-success" />
                  <span className="text-sm font-bold text-success">ACCESS GRANTED</span>
                </motion.div>
              )}

              {status === 'denied' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-error/20 backdrop-blur-md border border-error/30 px-6 py-3 rounded-2xl flex items-center gap-3"
                >
                  <ShieldAlert className="size-5 text-error" />
                  <span className="text-sm font-bold text-error">VERIFICATION FAILED</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls Overlay */}
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              <button 
                onClick={simulateScan}
                disabled={status === 'scanning' || status === 'locked'}
                className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-accent transition-all disabled:opacity-30"
              >
                <Camera className="size-5" />
              </button>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 size-12 border-t-2 border-l-2 border-white/20 m-6 rounded-tl-xl" />
            <div className="absolute top-0 right-0 size-12 border-t-2 border-r-2 border-white/20 m-6 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 size-12 border-b-2 border-l-2 border-white/20 m-6 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 size-12 border-b-2 border-r-2 border-white/20 m-6 rounded-br-xl" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-bg-card border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Status</p>
              <p className={`text-lg font-bold capitalize ${
                status === 'authorized' ? 'text-success' :
                status === 'denied' ? 'text-warning' :
                status === 'locked' ? 'text-error' :
                'text-text-primary'
              }`}>
                {status}
              </p>
            </div>
            <div className="bg-bg-card border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Confidence</p>
              <p className="text-lg font-bold font-mono">{(confidence * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-bg-card border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Lock Counter</p>
              <p className={`text-lg font-bold ${lockCounter > 0 ? 'text-warning' : 'text-text-primary'}`}>
                {lockCounter} / 3
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-white/5 rounded-2xl p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="size-4 text-accent" />
              Local Event Log
            </h4>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-xs text-text-secondary italic">No recent events...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-[11px] font-mono p-2 bg-white/2 rounded border border-white/5 text-text-secondary">
                    <span className="text-accent mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-bg-card border border-white/5 rounded-2xl p-6">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Settings2 className="size-4 text-accent" />
              Simulation Controls
            </h4>
            <div className="space-y-4">
              <button 
                onClick={simulateScan}
                disabled={status === 'scanning' || status === 'locked'}
                className="w-full py-3 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-30"
              >
                Trigger Face Recognition
              </button>
              <button 
                onClick={() => {
                  setLockCounter(2);
                  simulateScan();
                }}
                disabled={status === 'scanning' || status === 'locked'}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all disabled:opacity-30"
              >
                Simulate Unauthorized User
              </button>
              <button 
                onClick={() => {
                  setStatus('idle');
                  setLockCounter(0);
                  setConfidence(0);
                  setLogs([]);
                }}
                className="w-full py-3 text-text-secondary hover:text-text-primary text-sm font-medium transition-all"
              >
                Reset Simulation
              </button>
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 flex gap-3">
            <Info className="size-5 text-accent shrink-0 mt-0.5" />
            <p className="text-[11px] text-accent/80 leading-relaxed">
              This simulator demonstrates how the MobileNetV3 + SSD engine handles local verification and lock screen triggers based on server-defined thresholds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
