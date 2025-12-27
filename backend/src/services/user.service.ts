import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors';

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      teams: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (userId: string, newRole: UserRole) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  // Prevent changing the last admin's role
  if (user.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount <= 1) {
      throw new ForbiddenError('Cannot change the role of the last admin');
    }
  }

  // Update user role
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Toggle user active status (Admin only)
 */
export const toggleUserStatus = async (userId: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  // Prevent deactivating the last admin
  if (user.role === UserRole.ADMIN && user.isActive) {
    const activeAdminCount = await prisma.user.count({
      where: {
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    if (activeAdminCount <= 1) {
      throw new ForbiddenError('Cannot deactivate the last active admin');
    }
  }

  // Toggle user status
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
