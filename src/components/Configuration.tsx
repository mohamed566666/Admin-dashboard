import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  RotateCcw,
  Shield,
  AlertTriangle,
  Lock,
  Zap,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApi } from '../hooks/useApi';
import { configService } from '../services/config';
import { ConfigResponse } from '../services/types';

export default function Configuration() {
  const [config, setConfig] = useState({
    similarityThreshold: 0.85,
    lockThreshold: 3,
    detectionInterval: 500,
    noFacePenalty: 1,
    autoUnlock: false,
    enhancedLiveness: true
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Use the custom hook for API calls
  const { execute: fetchConfig, loading: loadingConfig } = useApi<ConfigResponse>();
  const { execute: updateConfig, loading: updatingConfig } = useApi<ConfigResponse>();

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const result = await fetchConfig(configService.getConfig());
    if (result.success && result.data) {
      setConfig({
        similarityThreshold: result.data.similarity_threshold,
        lockThreshold: result.data.lock_threshold,
        detectionInterval: result.data.detection_interval,
        noFacePenalty: result.data.no_face_penalty,
        autoUnlock: result.data.auto_unlock,
        enhancedLiveness: result.data.enhanced_liveness,
      });
    } else {
      showNotification('error', 'Failed to load configuration: ' + (result.error || 'Unknown error'));
    }
  };

  const handleChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    // Clear any existing notification when user makes changes
    if (notification) setNotification(null);
  };

  const handleReset = async () => {
    // Reload from server
    await loadConfig();
    setHasChanges(false);
    showNotification('success', 'Configuration reset to saved values');
  };

  const handleSave = async () => {
    // Prepare data for API
    const updateData = {
      similarity_threshold: config.similarityThreshold,
      lock_threshold: config.lockThreshold,
      detection_interval: config.detectionInterval,
      no_face_penalty: config.noFacePenalty,
      auto_unlock: config.autoUnlock,
      enhanced_liveness: config.enhancedLiveness,
    };

    const result = await updateConfig(configService.updateConfig(updateData));

    if (result.success) {
      setHasChanges(false);
      showNotification('success', 'Configuration saved successfully!');
      // Refresh config to get updated timestamps
      await loadConfig();
    } else {
      showNotification('error', 'Failed to save configuration: ' + (result.error || 'Unknown error'));
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const isLoading = loadingConfig || updatingConfig;

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="size-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${notification.type === 'success'
                ? 'bg-success/10 border border-success/20 text-success'
                : 'bg-error/10 border border-error/20 text-error'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <XCircle className="size-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">System Thresholds</h3>
          <p className="text-sm text-text-secondary">Configure recognition sensitivity and security parameters</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary disabled:opacity-30 transition-all"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 disabled:opacity-30 transition-all shadow-lg shadow-accent/20"
          >
            {updatingConfig ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recognition Settings */}
        <div className="bg-bg-card border border-white/5 rounded-2xl p-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Eye className="size-5" />
            </div>
            <h4 className="font-bold">Recognition Engine</h4>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Similarity Threshold</label>
                <span className="text-sm font-mono text-accent">{(config.similarityThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={config.similarityThreshold}
                onChange={(e) => handleChange('similarityThreshold', parseFloat(e.target.value))}
                disabled={isLoading}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-50"
              />
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Higher values increase security but may cause more false rejections in poor lighting.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Detection Interval</label>
                <span className="text-sm font-mono text-accent">{config.detectionInterval}ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={config.detectionInterval}
                onChange={(e) => handleChange('detectionInterval', parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent disabled:opacity-50"
              />
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Frequency of face detection scans. Lower values provide faster response but use more CPU.
              </p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-bg-card border border-white/5 rounded-2xl p-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning/10 text-warning rounded-lg">
              <Lock className="size-5" />
            </div>
            <h4 className="font-bold">Security Mechanism</h4>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Lock Counter Threshold</label>
                <span className="text-sm font-mono text-warning">{config.lockThreshold} events</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={config.lockThreshold}
                onChange={(e) => handleChange('lockThreshold', parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-warning disabled:opacity-50"
              />
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Number of consecutive failed verifications before the workstation is locked.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">No-Face Penalty</label>
                <span className="text-sm font-mono text-warning">+{config.noFacePenalty}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={config.noFacePenalty}
                onChange={(e) => handleChange('noFacePenalty', parseInt(e.target.value))}
                disabled={isLoading}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-warning disabled:opacity-50"
              />
              <p className="text-[10px] text-text-secondary leading-relaxed">
                How many points are added to the lock counter when no face is detected in frame.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Toggles */}
      <div className="bg-bg-card border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-success/10 text-success rounded-lg">
            <Zap className="size-5" />
          </div>
          <h4 className="font-bold">Advanced Features</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Shield className="size-5 text-success" />
              <div>
                <p className="text-sm font-bold">Enhanced Liveness</p>
                <p className="text-[10px] text-text-secondary">Prevent spoofing with photo/video</p>
              </div>
            </div>
            <button
              onClick={() => handleChange('enhancedLiveness', !config.enhancedLiveness)}
              disabled={isLoading}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.enhancedLiveness ? 'bg-success' : 'bg-white/10'} disabled:opacity-50`}
            >
              <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${config.enhancedLiveness ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-warning" />
              <div>
                <p className="text-sm font-bold">Auto-Unlock</p>
                <p className="text-[10px] text-text-secondary">Unlock when face is recognized</p>
              </div>
            </div>
            <button
              onClick={() => handleChange('autoUnlock', !config.autoUnlock)}
              disabled={isLoading}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.autoUnlock ? 'bg-success' : 'bg-white/10'} disabled:opacity-50`}
            >
              <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${config.autoUnlock ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-error/5 border border-error/20 rounded-2xl p-6 flex gap-4">
        <div className="p-2 bg-error/10 text-error rounded-lg h-fit">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-error mb-1">Security Implications</h5>
          <p className="text-xs text-error/80 leading-relaxed">
            Adjusting these thresholds directly affects the security posture of the entire organization.
            Lowering the similarity threshold or increasing the lock counter makes the system more convenient
            but significantly increases the risk of unauthorized access.
          </p>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="text-center text-xs text-text-secondary">
        {!loadingConfig && (
          <p>Last updated: {new Date().toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}