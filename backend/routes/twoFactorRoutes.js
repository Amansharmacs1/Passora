import express from 'express';
import {
  setup2FA,
  verify2FASetup,
  disable2FA
} from '../controllers/twoFactorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/setup', protect, setup2FA);
router.post('/verify-setup', protect, verify2FASetup);
router.delete('/', protect, disable2FA);

export default router;
