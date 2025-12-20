import { Router } from 'express';
import {
  submitFeedback,
  markAsTicketPrevention,
} from '../controllers/feedbackController';

const router = Router();

// Public routes (can be used without auth, but better with auth to track users)
router.post('/helpful', submitFeedback);
router.post('/ticket-prevented', markAsTicketPrevention);

export default router;