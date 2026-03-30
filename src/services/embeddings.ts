import api from './api';
import { EmbeddingResponse, VerifyResponse, CompareResponse } from './types';

export const embeddingsService = {
  // Register face embedding
  registerEmbedding: async (username: string, photo: File): Promise<EmbeddingResponse> => {
    const formData = new FormData();
    formData.append('image', photo);

    const response = await api.post(`/embeddings/${username}/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Verify face against stored embedding
  verifyEmbedding: async (username: string, photo: File): Promise<VerifyResponse> => {
    const formData = new FormData();
    formData.append('image', photo);

    const response = await api.post(`/embeddings/${username}/verify`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get embedding metadata
  getEmbedding: async (username: string): Promise<EmbeddingResponse> => {
    const response = await api.get(`/embeddings/${username}`);
    return response.data;
  },

  // Delete embedding
  deleteEmbedding: async (username: string): Promise<void> => {
    await api.delete(`/embeddings/${username}`);
  },

  // Compare two faces (debug)
  compareFaces: async (photo1: File, photo2: File): Promise<CompareResponse> => {
    const formData = new FormData();
    formData.append('image1', photo1);
    formData.append('image2', photo2);

    const response = await api.post('/embeddings/debug/compare', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};