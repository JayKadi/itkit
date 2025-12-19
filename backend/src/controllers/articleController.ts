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
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      content,
      quick_answer,
      category_id,
      status = 'draft',
      tags = [],
    }: CreateArticleRequest = req.body;

    // Validation
    if (!title || !content) {
      res.status(400).json({
        success: false,
        error: 'Title and content are required',
      });
      return;
    }

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
        error: 'Only IT staff can create articles',
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

    // Create article
    const { data: newArticle, error } = await (supabase
      .from('articles')
      .insert({
        title,
        slug,
        content,
        quick_answer: quick_answer || null,
        category_id: category_id || null,
        author_id: req.user!.id,
        status,
        estimated_read_time,
      } as any)
      .select(
        `
        *,
        category:categories(id, name, slug, icon),
        author:users(id, full_name)
      `
      )
      .single());

    if (error || !newArticle) {
      console.error('Create article error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create article',
      });
      return;
    }

    // Handle tags if provided
    if (tags.length > 0) {
      const articleTags = tags.map((tag_id) => ({
        article_id: (newArticle as any).id,
        tag_id,
      }));

      await (supabase as any).from('article_tags').insert(articleTags);
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

    let query = supabase
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
      );

    // Filter by status (default: published)
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by category slug
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryData) {
        query = query.eq('category_id', (categoryData as any).id);
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

    res.status(200).json({
      success: true,
      data: articles,
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

    const { data: article, error } = await (supabase
      .from('articles')
      .select(
        `
        *,
        category:categories(id, name, slug, icon),
        author:users(id, full_name, email),
        tags:article_tags(tag:tags(id, name, slug))
      `
      )
      .eq('slug', slug as any)
      .single());

    if (error || !article) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    // Increment view count
    await (supabase as any)
      .from('articles')
      .update({ view_count: (article as any).view_count + 1 })
      .eq('id', (article as any).id);

    res.status(200).json({
      success: true,
      data: article,
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
      tags,
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
    const { data: existingArticle, error: fetchError } = await (supabase
      .from('articles')
      .select('id, author_id')
      .eq('id', id as any)
      .single());

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
    const { data: updatedArticle, error: updateError } = await (supabase as any)
      .from('articles')
      .update(updateData)
      .eq('id', id as any)
      .select(
        `
        *,
        category:categories(id, name, slug, icon),
        author:users(id, full_name)
      `
      )
      .single();

    if (updateError || !updatedArticle) {
      console.error('Update article error:', updateError);
      res.status(500).json({
        success: false,
        error: 'Failed to update article',
      });
      return;
    }

    // Update tags if provided
    if (tags) {
      // Delete existing tags
      await (supabase as any).from('article_tags').delete().eq('article_id', id as any);

      // Insert new tags
      if (tags.length > 0) {
        const articleTags = tags.map((tag_id) => ({
          article_id: id,
          tag_id,
        }));

        await (supabase as any).from('article_tags').insert(articleTags);
      }
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
    const { data: existingArticle, error: fetchError } = await (supabase
      .from('articles')
      .select('id')
      .eq('id', id as any)
      .single());

    if (fetchError || !existingArticle) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    // Delete article (cascades to article_tags, feedback, etc.)
    const { error: deleteError } = await (supabase as any)
      .from('articles')
      .delete()
      .eq('id', id as any);

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

    const { data: article, error: fetchError } = await (supabase
      .from('articles')
      .select('id, view_count')
      .eq('id', id as any)
      .single());

    if (fetchError || !article) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    const { error: updateError } = await (supabase as any)
      .from('articles')
      .update({ view_count: (article as any).view_count + 1 })
      .eq('id', id as any);

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