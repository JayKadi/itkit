import { Router } from 'express';
import {
  createArticle,
  getArticles,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  incrementViewCount,
} from '../controllers/articleController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getArticles); // Get all published articles
router.get('/:slug', getArticleBySlug); // Get single article by slug
router.post('/:id/view', incrementViewCount); // Increment view count

// Protected routes (IT staff only)
router.post('/', authenticate, authorize('it_staff', 'admin'), createArticle);
router.put(
  '/:id',
  authenticate,
  authorize('it_staff', 'admin'),
  updateArticle
);

// Admin only
router.delete('/:id', authenticate, authorize('admin'), deleteArticle);

export default router;