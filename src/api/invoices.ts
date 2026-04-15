import apiClient from './client';
import { InvoiceCreate, InvoiceResponse, InvoiceListResponse } from './types';

export const invoicesAPI = {
  getInvoices: async (limit?: number, offset?: number): Promise<InvoiceListResponse> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());

    const response = await apiClient.get(`/api/invoices?${params}`);
    return response.data;
  },

  createInvoice: async (data: InvoiceCreate): Promise<InvoiceResponse> => {
    const response = await apiClient.post('/api/invoices', data);
    return response.data;
  },

  getInvoice: async (invoiceId: string): Promise<InvoiceResponse> => {
    const response = await apiClient.get(`/api/invoices/${invoiceId}`);
    return response.data;
  },

  deleteInvoice: async (invoiceId: string): Promise<void> => {
    await apiClient.delete(`/api/invoices/${invoiceId}`);
  },

  acceptInvoice: async (invoiceId: string): Promise<InvoiceResponse> => {
    const response = await apiClient.post(`/api/invoices/${invoiceId}/accept`);
    return response.data;
  },
};