import api from './api';
import type { ApiResponse, Category } from '../types';

export const categoryService = {
  // Get all categories
  getAll: async () => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  // Get articles by category
  getArticles: async (slug: string) => {
    const response = await api.get(`/categories/${slug}/articles`);
    return response.data;
  },
};