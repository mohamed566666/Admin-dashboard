import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import { configService } from "../services/config";
import { ConfigResponse } from "../services/types";

interface ConfigState {
  similarityThreshold: number;
  lockThreshold: number;
  detectionInterval: number;
  noFacePenalty: number;
  autoUnlock: boolean;
  enhancedLiveness: boolean;
}

export function useConfig() {
  const [config, setConfig] = useState<ConfigState>({
    similarityThreshold: 0.85,
    lockThreshold: 3,
    detectionInterval: 500,
    noFacePenalty: 1,
    autoUnlock: false,
    enhancedLiveness: true,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { execute: fetchConfig, loading: loadingConfig } =
    useApi<ConfigResponse>();
  const { execute: updateConfig, loading: updatingConfig } =
    useApi<ConfigResponse>();

  const loadConfig = useCallback(async () => {
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
      setHasChanges(false);
      return true;
    }
    return false;
  }, [fetchConfig]);

  const updateConfigValue = useCallback(
    (key: keyof ConfigState, value: any) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    [],
  );

  const saveConfig = useCallback(async () => {
    const result = await updateConfig(
      configService.updateConfig({
        similarity_threshold: config.similarityThreshold,
        lock_threshold: config.lockThreshold,
        detection_interval: config.detectionInterval,
        no_face_penalty: config.noFacePenalty,
        auto_unlock: config.autoUnlock,
        enhanced_liveness: config.enhancedLiveness,
      }),
    );

    if (result.success) {
      setHasChanges(false);
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [updateConfig, config]);

  const resetConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    hasChanges,
    loading: loadingConfig,
    saving: updatingConfig,
    updateConfig: updateConfigValue,
    saveConfig,
    resetConfig,
    loadConfig,
  };
}
