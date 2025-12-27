import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['TECHNICIAN', 'USER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    if (!validatedData.email || !validatedData.password || !validatedData.name) {
      throw new ValidationError('Email, password, and name are required');
    }

    const result = await authService.registerUser(validatedData as any);

    res.status(201).json(
      successResponse(result, 'User registered successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    if (!validatedData.email || !validatedData.password) {
      throw new ValidationError('Email and password are required');
    }

    const result = await authService.loginUser(validatedData as { email: string; password: string });

    res.json(
      successResponse(result, 'Login successful')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const profile = await authService.getUserProfile(req.user.userId);

    res.json(
      successResponse(profile)
    );
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
    });

    const validatedData = updateSchema.parse(req.body);

    const updatedUser = await authService.updateUserProfile(
      req.user.userId,
      validatedData
    );

    res.json(
      successResponse(updatedUser, 'Profile updated successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const changePasswordSchema = z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    });

    const validatedData = changePasswordSchema.parse(req.body);

    await authService.changePassword(
      req.user.userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    res.json(
      successResponse(null, 'Password changed successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};
