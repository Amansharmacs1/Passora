import express from 'express';
import {
  generateRegOptions,
  verifyRegResponse,
  generateAuthOptions,
  verifyAuthResponse,
  getPasskeys,
  deletePasskey
} from '../controllers/webauthnController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Registration (Requires active session/token)
router.get('/register/generate-options', protect, generateRegOptions);
router.post('/register/verify', protect, verifyRegResponse);

// Authentication (Public)
router.post('/auth/generate-options', generateAuthOptions);
router.post('/auth/verify', verifyAuthResponse);

// Management
router.get('/passkeys', protect, getPasskeys);
router.delete('/passkeys/:id', protect, deletePasskey);

export default router;
