import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Shield,
  AlertTriangle,
  Info,
  Lock,
  Zap,
  Eye,
  Settings2
} from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface ConfigResponse {
  similarity_threshold: number;
  lock_threshold: number;
  detection_interval: number;
  no_face_penalty: number;
  auto_unlock: boolean;
  enhanced_liveness: boolean;
}

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
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Add actual API calls for getting/saving config
  // const { execute: fetchConfig } = useApi<ConfigResponse>();
  // const { execute: saveConfig } = useApi<ConfigResponse>();

  // useEffect(() => {
  //   const loadConfig = async () => {
  //     const result = await fetchConfig(configService.getConfig());
  //     if (result.success && result.data) {
  //       setConfig({
  //         similarityThreshold: result.data.similarity_threshold,
  //         lockThreshold: result.data.lock_threshold,
  //         detectionInterval: result.data.detection_interval,
  //         noFacePenalty: result.data.no_face_penalty,
  //         autoUnlock: result.data.auto_unlock,
  //         enhancedLiveness: result.data.enhanced_liveness,
  //       });
  //     }
  //   };
  //   loadConfig();
  // }, []);

  const handleChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleReset = () => {
    setConfig({
      similarityThreshold: 0.85,
      lockThreshold: 3,
      detectionInterval: 500,
      noFacePenalty: 1,
      autoUnlock: false,
      enhancedLiveness: true
    });
    setHasChanges(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: Add API call to save config
    // const result = await saveConfig(configService.updateConfig({
    //   similarity_threshold: config.similarityThreshold,
    //   lock_threshold: config.lockThreshold,
    //   detection_interval: config.detectionInterval,
    //   no_face_penalty: config.noFacePenalty,
    //   auto_unlock: config.autoUnlock,
    //   enhanced_liveness: config.enhancedLiveness,
    // }));

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      alert('Configuration saved successfully!');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
            {isLoading ? (
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
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
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
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
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-warning"
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
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-warning"
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
              className={`w-12 h-6 rounded-full transition-colors relative ${config.enhancedLiveness ? 'bg-success' : 'bg-white/10'}`}
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
              className={`w-12 h-6 rounded-full transition-colors relative ${config.autoUnlock ? 'bg-success' : 'bg-white/10'}`}
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
    </div>
  );
}