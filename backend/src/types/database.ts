// Supabase database helper types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          full_name: string;
          role: 'user' | 'it_staff' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          full_name: string;
          role?: 'user' | 'it_staff' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          full_name?: string;
          role?: 'user' | 'it_staff' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          quick_answer: string | null;
          category_id: string | null;
          author_id: string | null;
          status: 'draft' | 'published' | 'archived';
          view_count: number;
          helpful_count: number;
          not_helpful_count: number;
          estimated_read_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          quick_answer?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          status?: 'draft' | 'published' | 'archived';
          view_count?: number;
          helpful_count?: number;
          not_helpful_count?: number;
          estimated_read_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          quick_answer?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          status?: 'draft' | 'published' | 'archived';
          view_count?: number;
          helpful_count?: number;
          not_helpful_count?: number;
          estimated_read_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}