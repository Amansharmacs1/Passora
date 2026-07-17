import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import masterPasswordRoutes from './routes/masterPasswordRoutes.js';
import twoFactorRoutes from './routes/twoFactorRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import importExportRoutes from './routes/importExportRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/master', masterPasswordRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/share', shareRoutes);
app.use('/api', importExportRoutes);

app.get('/', (req, res) => {
  res.send('Passora API is running...');
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
