import apiClient from './client';
import {
  CategoryWithChildrenResponse,
  CategoryResponse,
  ProductListResponse,
  ProductResponse,
  ProductShortResponse,
  SKUResponse,
} from './types';

export interface GetPublicProductsParams {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  seller_id?: string;
  page?: number;
  size?: number;
}

export const publicAPI = {
  getCategoriesTree: async (): Promise<CategoryWithChildrenResponse[]> => {
    const response = await apiClient.get('/api/public/categories/tree');
    return response.data;
  },

  getBreadcrumbs: async (categoryId: string): Promise<CategoryResponse[]> => {
    const response = await apiClient.get(`/api/public/categories/${categoryId}/breadcrumbs`);
    return response.data;
  },

  getProductsPublic: async (params?: GetPublicProductsParams): Promise<ProductListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.category_id) searchParams.append('category_id', params.category_id);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.min_price !== undefined) searchParams.append('min_price', params.min_price.toString());
    if (params?.max_price !== undefined) searchParams.append('max_price', params.max_price.toString());
    if (params?.seller_id) searchParams.append('seller_id', params.seller_id);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());

    const query = searchParams.toString();
    const response = await apiClient.get(`/api/public/products${query ? `?${query}` : ''}`);
    return response.data;
  },

  getProductPublic: async (productId: string): Promise<ProductResponse> => {
    const response = await apiClient.get(`/api/public/products/${productId}`);
    return response.data;
  },

  getSimilarProductsPublic: async (productId: string, limit?: number): Promise<ProductShortResponse[]> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());

    const query = params.toString();
    const response = await apiClient.get(`/api/public/products/${productId}/similar${query ? `?${query}` : ''}`);
    return response.data;
  },

  getSkuPublic: async (skuId: string): Promise<SKUResponse> => {
    const response = await apiClient.get(`/api/public/skus/${skuId}`);
    return response.data;
  },
};
