import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userService from '../services/user.service';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';

// Validation schemas
const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'USER']),
});

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers();
    res.json(successResponse(users, 'Users retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const validatedData = updateRoleSchema.parse(req.body);

    const updatedUser = await userService.updateUserRole(userId, validatedData.role);

    res.json(
      successResponse(updatedUser, 'User role updated successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

/**
 * Toggle user active status (Admin only)
 */
export const toggleUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const updatedUser = await userService.toggleUserStatus(userId);

    res.json(
      successResponse(updatedUser, 'User status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};
