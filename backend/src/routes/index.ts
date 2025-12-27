import { Router } from 'express';
import authRoutes from './auth.routes';
import equipmentRoutes from './equipment.routes';
import teamRoutes from './team.routes';
import requestRoutes from './request.routes';
import reportRoutes from './report.routes';
import userRoutes from './user.routes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/teams', teamRoutes);
router.use('/requests', requestRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GearGuard API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
