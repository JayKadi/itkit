import { Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { CreateFeedbackRequest, AuthRequest } from '../types';

// =====================================================
// SUBMIT FEEDBACK (Helpful/Not Helpful)
// =====================================================
export const submitFeedback = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { article_id, is_helpful, comment }: CreateFeedbackRequest = req.body;

    // Validation
    if (!article_id || is_helpful === undefined) {
      res.status(400).json({
        success: false,
        error: 'article_id and is_helpful are required',
      });
      return;
    }

    // Check if article exists
    const { data: article, error: articleError } = await (supabase
      .from('articles')
      .select('id, helpful_count, not_helpful_count')
      .eq('id', article_id as any)
      .single());

    if (articleError || !article) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    // Create feedback record
    const { error: feedbackError } = await (supabase as any)
      .from('article_feedback')
      .insert({
        article_id,
        user_id: req.user?.id || null,
        is_helpful,
        comment: comment || null,
      });

    if (feedbackError) {
      console.error('Submit feedback error:', feedbackError);
      res.status(500).json({
        success: false,
        error: 'Failed to submit feedback',
      });
      return;
    }

    // Update article helpful/not_helpful count
    const updateData = is_helpful
      ? { helpful_count: (article as any).helpful_count + 1 }
      : { not_helpful_count: (article as any).not_helpful_count + 1 };

    await (supabase as any)
      .from('articles')
      .update(updateData)
      .eq('id', article_id as any);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while submitting feedback',
    });
  }
};

// =====================================================
// MARK ARTICLE AS TICKET PREVENTION
// =====================================================
export const markAsTicketPrevention = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { article_id, issue_type } = req.body;

    if (!article_id) {
      res.status(400).json({
        success: false,
        error: 'article_id is required',
      });
      return;
    }

    // Check if article exists
    const { data: article, error: articleError } = await (supabase
      .from('articles')
      .select('id')
      .eq('id', article_id as any)
      .single());

    if (articleError || !article) {
      res.status(404).json({
        success: false,
        error: 'Article not found',
      });
      return;
    }

    // Create ticket prevention record
    const { error } = await (supabase as any)
      .from('ticket_preventions')
      .insert({
        article_id,
        user_id: req.user?.id || null,
        issue_type: issue_type || null,
      });

    if (error) {
      console.error('Mark as ticket prevention error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record ticket prevention',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Marked as ticket prevention successfully',
    });
  } catch (error) {
    console.error('Mark as ticket prevention error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while recording ticket prevention',
    });
  }
};