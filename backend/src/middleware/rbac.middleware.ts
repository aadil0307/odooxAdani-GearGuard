import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);

export const requireManagerOrAdmin = requireRole(UserRole.ADMIN, UserRole.MANAGER);

export const requireTechnicianOrAbove = requireRole(
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.TECHNICIAN
);
