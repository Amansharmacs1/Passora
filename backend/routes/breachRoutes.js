import express from 'express';
import { checkSinglePassword, scanVault } from '../controllers/breachController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check-single', protect, checkSinglePassword);
router.post('/scan-vault', protect, scanVault);

export default router;
