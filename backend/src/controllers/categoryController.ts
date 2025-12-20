import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';

// =====================================================
// GET ALL CATEGORIES
// =====================================================
export const getCategories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching categories',
    });
  }
};

// =====================================================
// GET ARTICLES BY CATEGORY
// =====================================================
export const getArticlesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get category
    const { data: category, error: categoryError } = await (supabase
      .from('categories')
      .select('*')
      .eq('slug', slug as any)
      .single());

    if (categoryError || !category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    // Get articles in this category
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    const { data: articles, error, count } = await supabase
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
      `,
        { count: 'exact' }
      )
      .eq('category_id', (category as any).id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offsetNum, offsetNum + limitNum - 1);

    if (error) {
      console.error('Get articles by category error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch articles',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        category,
        articles,
        pagination: {
          total: count || 0,
          limit: limitNum,
          offset: offsetNum,
          hasMore: count ? offsetNum + limitNum < count : false,
        },
      },
    });
  } catch (error) {
    console.error('Get articles by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching articles',
    });
  }
};