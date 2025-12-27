import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user (Admin only for creating non-USER roles)
 * @access  Public (USER role) / Protected (other roles require admin)
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update current user profile
 * @access  Protected
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Protected
 */
router.post('/change-password', authenticate, authController.changePassword);

export default router;
