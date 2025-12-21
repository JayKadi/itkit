// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types
export type UserRole = 'user' | 'it_staff' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  created_at: string;
}

// Article types
export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  quick_answer: string | null;
  category: Category | null;
  author: {
    id: string;
    full_name: string;
  } | null;
  status: ArticleStatus;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  estimated_read_time: number;
  created_at: string;
  updated_at: string;
}

// Pagination
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}