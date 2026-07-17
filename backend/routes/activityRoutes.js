import express from 'express';
import { getActivityTimeline, getLoginHistory, logActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getActivityTimeline);
router.get('/login-history', getLoginHistory);
router.post('/log', logActivity);

export default router;
