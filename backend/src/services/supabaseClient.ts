import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type-safe table helpers
export const tables = {
  users: () => supabase.from('users'),
  categories: () => supabase.from('categories'),
  articles: () => supabase.from('articles'),
  tags: () => supabase.from('tags'),
  articleTags: () => supabase.from('article_tags'),
  articleFeedback: () => supabase.from('article_feedback'),
  searchLogs: () => supabase.from('search_logs'),
  ticketPreventions: () => supabase.from('ticket_preventions'),
  repairLogs: () => supabase.from('repair_logs'),
};