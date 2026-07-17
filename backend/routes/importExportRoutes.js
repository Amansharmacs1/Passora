import express from 'express';
import {
  importCSV,
  exportJSON,
  exportCSV
} from '../controllers/importExportController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', protect, upload.single('file'), importCSV);
router.get('/export/json', protect, exportJSON);
router.get('/export/csv', protect, exportCSV);

export default router;
