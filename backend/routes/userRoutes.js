import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes below are protected

router.route('/profile').get(getUserProfile).put(updateUserProfile);
router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

export default router;
