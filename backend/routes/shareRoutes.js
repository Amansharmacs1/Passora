import express from 'express';
import {
  createShare,
  getShare,
  getShareHistory,
  revokeShare
} from '../controllers/shareController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createShare);
router.get('/', protect, getShareHistory);
router.get('/:token', getShare); // Public
router.delete('/:id', protect, revokeShare);

export default router;
