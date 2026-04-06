import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  toggleSubscription,
  getSubscriptionStatus
} from '../controllers/subscription.controller.js';

const router = express.Router();

router.get('/:channelId', authMiddleware, getSubscriptionStatus);
router.post('/:channelId', authMiddleware, toggleSubscription);

export default router;