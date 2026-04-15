import apiClient from './client';
import { CategoryCreate, CategoryResponse, CategoryUpdate, CategoryWithChildrenResponse } from './types';

export const categoriesAPI = {
  getCategories: async (parentId?: string, onlyRoot?: boolean): Promise<CategoryResponse[]> => {
    const params = new URLSearchParams();
    if (parentId) params.append('parent_id', parentId);
    if (onlyRoot !== undefined) params.append('only_root', onlyRoot.toString());

    const response = await apiClient.get(`/api/categories?${params}`);
    return response.data;
  },

  createCategory: async (data: CategoryCreate): Promise<CategoryWithChildrenResponse> => {
    const response = await apiClient.post('/api/categories', data);
    return response.data;
  },

  getCategory: async (categoryId: string): Promise<CategoryWithChildrenResponse> => {
    const response = await apiClient.get(`/api/categories/${categoryId}`);
    return response.data;
  },

  updateCategory: async (categoryId: string, data: CategoryUpdate): Promise<CategoryWithChildrenResponse> => {
    const response = await apiClient.patch(`/api/categories/${categoryId}`, data);
    return response.data;
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/api/categories/${categoryId}`);
  },
};