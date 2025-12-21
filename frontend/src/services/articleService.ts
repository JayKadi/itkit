import api from './api';
import type { ApiResponse, Article, PaginationMeta } from '../types';

export const articleService = {
  // Get all articles
  getAll: async (params?: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get<ApiResponse<Article[]> & { pagination?: PaginationMeta }>('/articles', { params });
    return response.data;
  },

  // Get single article by slug
  getBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<Article>>(`/articles/${slug}`);
    return response.data;
  },

  // Create article (IT staff only)
  create: async (data: {
    title: string;
    content: string;
    quick_answer?: string;
    category_id?: string;
    status?: string;
  }) => {
    const response = await api.post<ApiResponse<Article>>('/articles', data);
    return response.data;
  },

  // Update article
  update: async (id: string, data: any) => {
    const response = await api.put<ApiResponse<Article>>(`/articles/${id}`, data);
    return response.data;
  },

  // Delete article
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/articles/${id}`);
    return response.data;
  },
};