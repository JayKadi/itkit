import { Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { AuthRequest } from '../types';

// Helper function to extract quick answer from content
const extractQuickAnswer = (content: string): string | null => {
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, '');
  
  // Look for numbered list pattern (1. 2. 3.)
  const numberedMatch = content.match(/<ol>(.*?)<\/ol>/s);
  if (numberedMatch && numberedMatch[1]) {
    const listItems = numberedMatch[1].match(/<li>(.*?)<\/li>/g);
    if (listItems && listItems.length > 0) {
      return listItems
        .slice(0, 5) // First 5 steps max
        .map((item, idx) => `${idx + 1}. ${item.replace(/<\/?li>/g, '')}`)
        .join('\n');
    }
  }
  
  // Look for bullet points
  const bulletMatch = content.match(/<ul>(.*?)<\/ul>/s);
  if (bulletMatch && bulletMatch[1]) {
    const listItems = bulletMatch[1].match(/<li>(.*?)<\/li>/g);
    if (listItems && listItems.length > 0) {
      return listItems
        .slice(0, 5)
        .map(item => `• ${item.replace(/<\/?li>/g, '')}`)
        .join('\n');
    }
  }
  
  // Fallback: return first 2-3 sentences
  const sentences = textContent.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    return sentences.slice(0, 3).join(' ').trim();
  }
  
  return null;
};

// =====================================================
// SEARCH ARTICLES
// =====================================================
export const searchArticles = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
      return;
    }

    const searchTerm = q.trim();

    if (searchTerm.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
      return;
    }

    // Search articles using PostgreSQL ILIKE (case-insensitive)
    const { data: articles, error } = await (supabase
      .from('articles')
      .select(
        `
        id,
        title,
        slug,
        content,
        quick_answer,
        category:categories(id, name, slug, icon),
        author:users(id, full_name),
        status,
        view_count,
        helpful_count,
        not_helpful_count,
        estimated_read_time,
        created_at,
        updated_at
      `
      )
      .eq('status', 'published')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,quick_answer.ilike.%${searchTerm}%`)
      .order('view_count', { ascending: false })
      .limit(20) as any);

    if (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search articles',
      });
      return;
    }

    // Generate quick answer from top result
    let quickAnswer = null;
    let sourceArticle = null;

    if (articles && articles.length > 0) {
      const topArticle = articles[0];

      // Use manual quick_answer if it exists
      if (topArticle.quick_answer) {
        quickAnswer = topArticle.quick_answer;
      } else {
        // Extract from content
        quickAnswer = extractQuickAnswer(topArticle.content);
      }

      sourceArticle = {
        title: topArticle.title,
        slug: topArticle.slug,
      };
    }

    // Log search for analytics
    await (supabase as any).from('search_logs').insert({
      search_term: searchTerm,
      results_count: articles?.length || 0,
      top_result_id: articles?.[0]?.id || null,
      user_id: req.user?.id || null,
    });

    res.status(200).json({
      success: true,
      data: {
        quickAnswer,
        sourceArticle,
        articles: articles || [],
        searchTerm,
        totalResults: articles?.length || 0,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while searching',
    });
  }
};