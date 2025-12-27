import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/reports/dashboard
 * @desc    Get dashboard statistics
 * @access  Protected
 */
router.get('/dashboard', reportController.getDashboardStats);

/**
 * @route   GET /api/v1/reports/by-team
 * @desc    Get requests grouped by maintenance team
 * @access  Protected
 */
router.get('/by-team', reportController.getRequestsByTeam);

/**
 * @route   GET /api/v1/reports/by-category
 * @desc    Get requests grouped by equipment category
 * @access  Protected
 */
router.get('/by-category', reportController.getRequestsByCategory);

/**
 * @route   GET /api/v1/reports/by-status
 * @desc    Get requests grouped by status
 * @access  Protected
 */
router.get('/by-status', reportController.getRequestsByStatus);

/**
 * @route   GET /api/v1/reports/duration
 * @desc    Get duration analysis for completed requests
 * @access  Protected
 */
router.get('/duration', reportController.getDurationAnalysis);

export default router;
