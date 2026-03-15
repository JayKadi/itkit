import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import {
  CreateArticleRequest,
  UpdateArticleRequest,
  AuthRequest,
} from '../types';

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Helper function to calculate read time
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, '');
  const wordCount = textContent.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

// =====================================================
// CREATE ARTICLE
// =====================================================
export const createArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      content,
      quick_answer,
      category_id,
      status = 'draft',
    }: CreateArticleRequest = req.body;

    // Validation
    if (!title || !content) {
      res.status(400).json({
        success: false,
        error: 'Title and content are required',
      });
      return;
    }

    // Generate slug
    const slug = generateSlug(title);

    // Check if slug already exists
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingArticle) {
      res.status(400).json({
        success: false,
        error: 'An article with this title already exists',
      });
      return;
    }

    // Calculate estimated read time
    const estimated_read_time = calculateReadTime(content);

    // Create article (no auth required for demo)
    const { data: newArticle, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        content,
        quick_answer: quick_answer || null,
        category_id: category_id || null,
        author_id: null,
        status,
        estimated_read_time,
      })
      .select('*')
      .single();

    if (error || !newArticle) {
      console.error('Create article error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create article',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: newArticle,
      message: 'Article created successfully',
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating article',
    });
  }
};

// =====================================================
// GET ALL ARTICLES (with filters)
// =====================================================
export const getArticles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      status = 'published',
      category,
      limit = 20,
      offset = 0,
    } = req.query;

    // Build query without joins
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' });

    // Filter by status (unless status is "all")
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by category slug
    if (category && typeof category === 'string') {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    query = query
      .order('created_at', { ascending: false })
      .range(offsetNum, offsetNum + limitNum - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Get articles error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch articles',
      });
      return;
    }

    // Manually fetch categories for articles
    const categoryIds = articles
      ?.map((a: any) => a.category_id)
      .filter((id: any) => id !== null) || [];

    let categoriesMap: { [key: string]: any } = {};

    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .in('id', categoryIds);

      if (categories) {
        categoriesMap = categories.reduce((acc: any, cat: any) => {
          acc[cat.id] = cat;
          return acc;
        }, {});
      }
    }

    // Attach categories to articles
    const articlesWithCategories = articles?.map((article: any) => ({
      ...article,
      category: article.category_id ? categoriesMap[article.category_id] : null,
      author: null,
    }));

    res.status(200).json({
      success: true,
      data: articlesWithCategories || [],
      pagination: {
        total: count || 0,
        limit: limitNum,
        offset: offsetNum,
        hasMore: count ? offsetNum + limitNum < count : false,
      },
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching articles',
    });
  }
};

// =====================================================
// GET SINGLE ARTICLE BY SLUG
// =====================================================
export const getArticleBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !article) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    // Manually fetch category if exists
    let category = null;
    if ((article as any).category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('id', (article as any).category_id)
        .single();
      category = categoryData;
    }

    // Increment view count
    await supabase
      .from('articles')
      .update({ view_count: (article as any).view_count + 1 })
      .eq('id', (article as any).id);

    res.status(200).json({
      success: true,
      data: {
        ...article,
        category,
        author: null,
      },
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching article',
    });
  }
};

// =====================================================
// UPDATE ARTICLE
// =====================================================
export const updateArticle = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      quick_answer,
      category_id,
      status,
    }: UpdateArticleRequest = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Check if user is IT staff or admin
    if (req.user.role !== 'it_staff' && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Only IT staff can update articles',
      });
      return;
    }

    // Check if article exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id, author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingArticle) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    // Build update object
    const updateData: any = {};

    if (title) {
      updateData.title = title;
      updateData.slug = generateSlug(title);
    }

    if (content) {
      updateData.content = content;
      updateData.estimated_read_time = calculateReadTime(content);
    }

    if (quick_answer !== undefined) {
      updateData.quick_answer = quick_answer;
    }

    if (category_id !== undefined) {
      updateData.category_id = category_id;
    }

    if (status) {
      updateData.status = status;
    }

    // Update article
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError || !updatedArticle) {
      console.error('Update article error:', updateError);
      res.status(500).json({
        success: false,
        error: 'Failed to update article',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully',
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating article',
    });
  }
};

// =====================================================
// DELETE ARTICLE
// =====================================================
export const deleteArticle = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    // Only admins can delete articles
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Only admins can delete articles',
      });
      return;
    }

    // Check if article exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingArticle) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    // Delete article
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete article error:', deleteError);
      res.status(500).json({
        success: false,
        error: 'Failed to delete article',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting article',
    });
  }
};

// =====================================================
// INCREMENT VIEW COUNT
// =====================================================
export const incrementViewCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id, view_count')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    const { error: updateError } = await supabase
      .from('articles')
      .update({ view_count: (article as any).view_count + 1 })
      .eq('id', id);

    if (updateError) {
      res.status(500).json({
        success: false,
        error: 'Failed to update view count',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'View count updated',
    });
  } catch (error) {
    console.error('Increment view error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating view count',
    });
  }
};