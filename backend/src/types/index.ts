import { Request } from 'express';

// =====================================================
// USER TYPES
// =====================================================

export type UserRole = 'user' | 'it_staff' | 'admin';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// User without sensitive data (for responses)
export interface UserPublic {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

// User registration request
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// User login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Auth response
export interface AuthResponse {
  user: UserPublic;
  token: string;
}

// =====================================================
// CATEGORY TYPES
// =====================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

// =====================================================
// ARTICLE TYPES
// =====================================================

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  quick_answer: string | null;
  category_id: string | null;
  author_id: string | null;
  status: ArticleStatus;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  estimated_read_time: number;
  created_at: string;
  updated_at: string;
}

// Article with related data (for detailed views)
export interface ArticleWithRelations extends Article {
  category?: Category;
  author?: UserPublic;
  tags?: Tag[];
}

// Article list item (for search results)
export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  quick_answer: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  } | null;
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

// Create article request
export interface CreateArticleRequest {
  title: string;
  slug: string;
  content: string;
  quick_answer?: string;
  category_id?: string;
  status?: ArticleStatus;
  tags?: string[]; // Array of tag IDs
}

// Update article request
export interface UpdateArticleRequest {
  title?: string;
  slug?: string;
  content?: string;
  quick_answer?: string;
  category_id?: string;
  status?: ArticleStatus;
  tags?: string[];
}

// =====================================================
// TAG TYPES
// =====================================================

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CreateTagRequest {
  name: string;
  slug: string;
}

// =====================================================
// ARTICLE FEEDBACK TYPES
// =====================================================

export interface ArticleFeedback {
  id: string;
  article_id: string;
  user_id: string | null;
  is_helpful: boolean;
  comment: string | null;
  created_at: string;
}

export interface CreateFeedbackRequest {
  article_id: string;
  is_helpful: boolean;
  comment?: string;
}

// =====================================================
// SEARCH TYPES
// =====================================================

export interface SearchLog {
  id: string;
  search_term: string;
  results_count: number;
  user_id: string | null;
  top_result_id: string | null;
  created_at: string;
}

export interface SearchRequest {
  q: string; // search query
  category?: string; // filter by category slug
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  quickAnswer: string | null;
  sourceArticle: {
    title: string;
    slug: string;
  } | null;
  articles: ArticleListItem[];
  searchTerm: string;
  totalResults: number;
}

// =====================================================
// TICKET PREVENTION TYPES
// =====================================================

export interface TicketPrevention {
  id: string;
  article_id: string;
  user_id: string | null;
  issue_type: string | null;
  created_at: string;
}

export interface CreateTicketPreventionRequest {
  article_id: string;
  issue_type?: string;
}

// =====================================================
// REPAIR LOG TYPES
// =====================================================

export interface RepairLog {
  id: string;
  device_name: string;
  asset_tag: string | null;
  issue_description: string;
  resolution: string | null;
  cost: number | null;
  repaired_by: string | null;
  repaired_at: string;
  created_at: string;
}

// Repair log with technician info
export interface RepairLogWithTechnician extends RepairLog {
  technician?: UserPublic;
}

export interface CreateRepairLogRequest {
  device_name: string;
  asset_tag?: string;
  issue_description: string;
  resolution?: string;
  cost?: number;
  repaired_by?: string;
}

export interface UpdateRepairLogRequest {
  device_name?: string;
  asset_tag?: string;
  issue_description?: string;
  resolution?: string;
  cost?: number;
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

export interface TopArticle {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  helpful_percentage: number;
}

export interface TopSearchTerm {
  search_term: string;
  search_count: number;
}

export interface AnalyticsSummary {
  totalArticles: number;
  totalViews: number;
  totalSearches: number;
  totalTicketsPrevented: number;
  topArticles: TopArticle[];
  topSearchTerms: TopSearchTerm[];
}

// =====================================================
// PAGINATION TYPES
// =====================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

// =====================================================
// EXPRESS REQUEST TYPES (with user attached)
// =====================================================

export interface AuthRequest extends Request {
  user?: UserPublic;
}