import express from 'express';
import {
  setupMasterPassword,
  changeMasterPassword,
  verifyMasterPassword,
  removeMasterPassword
} from '../controllers/masterPasswordController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, setupMasterPassword);
router.put('/change', protect, changeMasterPassword);
router.post('/verify', protect, verifyMasterPassword);
router.delete('/remove', protect, removeMasterPassword);

export default router;
