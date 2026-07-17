import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyLogin2FA
} from '../controllers/authController.js';
import { validateRegister } from '../validators/authValidators.js';

const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';

router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/login-2fa', verifyLogin2FA);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

export default router;
