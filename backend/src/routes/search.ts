import { Router } from 'express';
import { searchArticles } from '../controllers/searchController';

const router = Router();

// Public route
router.get('/', searchArticles);

export default router;