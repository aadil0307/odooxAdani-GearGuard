import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || UserRole.USER,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken({
    id: user.id,
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

export const loginUser = async (data: LoginData) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
          description: true,
        },
      },
      assignedRequests: {
        where: {
          status: { in: ['NEW', 'IN_PROGRESS'] },
        },
        select: {
          id: true,
          subject: true,
          status: true,
          requestType: true,
          scheduledDate: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: { name?: string; email?: string }
) => {
  // If email is being updated, check if it's already taken
  if (data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError('Email is already in use');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
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

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password updated successfully' };
};
