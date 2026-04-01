import api from "./api";
import { ConfigResponse, ConfigUpdateRequest } from "./types";

export const configService = {
  /**
   * Get current system configuration
   */
  getConfig: async (): Promise<ConfigResponse> => {
    const response = await api.get("/config");
    return response.data;
  },

  /**
   * Update system configuration
   */
  updateConfig: async (data: ConfigUpdateRequest): Promise<ConfigResponse> => {
    const response = await api.put("/config", data);
    return response.data;
  },
};
