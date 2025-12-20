import { Router } from 'express';
import {
  getCategories,
  getArticlesByCategory,
} from '../controllers/categoryController';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug/articles', getArticlesByCategory);

export default router;