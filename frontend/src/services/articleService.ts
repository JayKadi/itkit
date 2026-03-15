import api from './api';
import type { Article } from '../types';

export const articleService = {
  // Fetch all articles (Updated to allow category filtering)
  getAll: async (params?: { status?: string; limit?: number; category?: string; categoryId?: string }) => {
    const response = await api.get('/articles', { params });
    return response.data;
  },
  
  // 1. NEW: Get a single article by ID (Crucial for the Edit Page)
  getById: async (id: string) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },
  // 🚀 ADD THIS NEW METHOD HERE:
  getBySlug: async (slug: string) => {
    const response = await api.get(`/articles/slug/${slug}`);
    return response.data;
  },

  // Create a new article
  create: async (data: Partial<Article>) => {
    const response = await api.post('/articles', data);
    return response.data;
  },

  // 2. NEW: Update an existing article (The "U" in CRUD)
  update: async (id: string, data: Partial<Article>) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data;
  },

  // Delete an article
  delete: async (id: string) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
  },
};