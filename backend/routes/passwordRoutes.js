import express from 'express';
import { getPasswordHistory, checkPasswordStrength, generatePassword } from '../controllers/passwordController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/history/:id', getPasswordHistory);
router.post('/check-strength', checkPasswordStrength);
router.post('/generate', generatePassword);

export default router;
