import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireManagerOrAdmin } from '../middleware/rbac.middleware';

const router = Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (Manager and Admin)
 * @access  Private (Manager/Admin)
 */
router.get(
  '/',
  authenticate,
  requireManagerOrAdmin,
  userController.getAllUsers
);

/**
 * @route   PATCH /api/v1/users/:userId/role
 * @desc    Update user role (Admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:userId/role',
  authenticate,
  requireAdmin,
  userController.updateUserRole
);

/**
 * @route   PATCH /api/v1/users/:userId/status
 * @desc    Toggle user active status (Admin only)
 * @access  Private (Admin)
 */
router.patch(
  '/:userId/status',
  authenticate,
  requireAdmin,
  userController.toggleUserStatus
);

export default router;
