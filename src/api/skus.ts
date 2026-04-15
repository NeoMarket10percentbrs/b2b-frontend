import apiClient from './client';
import {
  SKUCreate,
  SKUResponse,
  SKUUpdate,
  SKUImageResponse,
  SKUImageUpdateRequest,
  SKUImageCreateRequest,
} from './types';

export const skusAPI = {
  getSkusByProduct: async (productId: string): Promise<SKUResponse[]> => {
    const response = await apiClient.get(`/api/skus/by-product/${productId}`);
    return response.data;
  },

  getSku: async (skuId: string): Promise<SKUResponse> => {
    const response = await apiClient.get(`/api/skus/${skuId}`);
    return response.data;
  },

  updateSku: async (skuId: string, data: SKUUpdate): Promise<SKUResponse> => {
    const response = await apiClient.patch(`/api/skus/${skuId}`, data);
    return response.data;
  },

  deleteSku: async (skuId: string): Promise<void> => {
    await apiClient.delete(`/api/skus/${skuId}`);
  },

  createSku: async (data: SKUCreate): Promise<SKUResponse> => {
    const response = await apiClient.post('/api/skus/create', data);
    return response.data;
  },

  updateSkuImage: async (imageId: string, data: SKUImageUpdateRequest): Promise<SKUImageResponse> => {
    const response = await apiClient.patch(`/api/skus/images/${imageId}`, data);
    return response.data;
  },

  deleteSkuImage: async (imageId: string): Promise<void> => {
    await apiClient.delete(`/api/skus/images/${imageId}`);
  },

  addSkuImage: async (skuId: string, data: SKUImageCreateRequest): Promise<SKUImageResponse> => {
    const response = await apiClient.post(`/api/skus/${skuId}/images`, data);
    return response.data;
  },
};