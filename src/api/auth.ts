import apiClient from './client';
import { SellerCreate, SellerResponse, SellerUpdate, TokenResponse, RefreshRequest } from './types';

export const authAPI = {
  register: async (data: SellerCreate): Promise<SellerResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  login: async (username: string, password: string): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const response = await apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  refresh: async (data: RefreshRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/auth/refresh', data);
    return response.data;
  },

  logout: async (data: RefreshRequest): Promise<void> => {
    await apiClient.post('/api/auth/logout', data);
  },

  getProfile: async (): Promise<SellerResponse> => {
    const response = await apiClient.get('/api/seller/profile');
    return response.data;
  },

  updateProfile: async (data: SellerUpdate): Promise<SellerResponse> => {
    const response = await apiClient.patch('/api/seller/profile/update', data);
    return response.data;
  },

  deleteProfile: async (): Promise<void> => {
    await apiClient.delete('/api/seller/profile/delete');
  },
};