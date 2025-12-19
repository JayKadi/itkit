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
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      article_tags: {
        Row: {
          article_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          article_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          article_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      article_feedback: {
        Row: {
          id: string;
          article_id: string;
          user_id: string | null;
          is_helpful: boolean;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          user_id?: string | null;
          is_helpful: boolean;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          user_id?: string | null;
          is_helpful?: boolean;
          comment?: string | null;
          created_at?: string;
        };
      };
      search_logs: {
        Row: {
          id: string;
          search_term: string;
          results_count: number;
          user_id: string | null;
          top_result_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          search_term: string;
          results_count: number;
          user_id?: string | null;
          top_result_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          search_term?: string;
          results_count?: number;
          user_id?: string | null;
          top_result_id?: string | null;
          created_at?: string;
        };
      };
      ticket_preventions: {
        Row: {
          id: string;
          article_id: string;
          user_id: string | null;
          issue_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          user_id?: string | null;
          issue_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          user_id?: string | null;
          issue_type?: string | null;
          created_at?: string;
        };
      };
      repair_logs: {
        Row: {
          id: string;
          device_name: string;
          asset_tag: string | null;
          issue_description: string;
          resolution: string | null;
          cost: number | null;
          repaired_by: string | null;
          repaired_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_name: string;
          asset_tag?: string | null;
          issue_description: string;
          resolution?: string | null;
          cost?: number | null;
          repaired_by?: string | null;
          repaired_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_name?: string;
          asset_tag?: string | null;
          issue_description?: string;
          resolution?: string | null;
          cost?: number | null;
          repaired_by?: string | null;
          repaired_at?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}