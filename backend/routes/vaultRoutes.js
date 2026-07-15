import express from 'express';
import {
  getVaults,
  searchVaults,
  getVaultById,
  createVault,
  updateVault,
  deleteVault,
  archiveVault,
  favoriteVault,
  restoreVault,
  permanentDeleteVault,
  getTrashVaults
} from '../controllers/vaultController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getVaults).post(createVault);
router.route('/search').get(searchVaults);
router.route('/trash').get(getTrashVaults);

router
  .route('/:id')
  .get(getVaultById)
  .put(updateVault)
  .delete(deleteVault);

router.patch('/:id/archive', archiveVault);
router.patch('/:id/favorite', favoriteVault);
router.patch('/:id/restore', restoreVault);
router.delete('/:id/permanent', permanentDeleteVault);

export default router;
