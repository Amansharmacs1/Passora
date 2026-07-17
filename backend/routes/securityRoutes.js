import express from 'express';
import { getSecurityReport, getScoreTrend } from '../controllers/securityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/report', getSecurityReport);
router.get('/score-trend', getScoreTrend);

export default router;
