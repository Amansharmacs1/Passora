import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/authController.js';
import { validateRegister } from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

export default router;
