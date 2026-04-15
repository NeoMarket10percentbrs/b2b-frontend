import apiClient from './client';
import {
  ProductCreate,
  ProductResponse,
  ProductUpdate,
  ProductListResponse,
  ProductImageResponse,
  ProductImageUpdateRequest,
  ProductImageCreateRequest,
} from './types';

export const productsAPI = {
  getProducts: async (limit?: number, offset?: number): Promise<ProductListResponse> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());

    const response = await apiClient.get(`/api/products?${params}`);
    return response.data;
  },

  createProduct: async (data: ProductCreate): Promise<ProductResponse> => {
    const response = await apiClient.post('/api/products', data);
    return response.data;
  },

  getProduct: async (productId: string): Promise<ProductResponse> => {
    const response = await apiClient.get(`/api/products/${productId}`);
    return response.data;
  },

  updateProduct: async (productId: string, data: ProductUpdate): Promise<ProductResponse> => {
    const response = await apiClient.patch(`/api/products/${productId}`, data);
    return response.data;
  },

  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete(`/api/products/${productId}`);
  },

  updateProductImage: async (imageId: string, data: ProductImageUpdateRequest): Promise<ProductImageResponse> => {
    const response = await apiClient.patch(`/api/products/images/${imageId}`, data);
    return response.data;
  },

  deleteProductImage: async (imageId: string): Promise<void> => {
    await apiClient.delete(`/api/products/images/${imageId}`);
  },

  addProductImage: async (productId: string, data: ProductImageCreateRequest): Promise<ProductImageResponse> => {
    const response = await apiClient.post(`/api/products/${productId}/images`, data);
    return response.data;
  },
};