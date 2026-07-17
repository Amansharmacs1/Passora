import express from 'express';
import {
  getSessions,
  revokeSession,
  revokeAllSessions
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSessions)
  .delete(protect, revokeAllSessions);

router.delete('/:id', protect, revokeSession);

export default router;
