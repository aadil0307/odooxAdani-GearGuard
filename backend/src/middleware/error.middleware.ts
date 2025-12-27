import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.code || 'ERROR', err.message, err.details)
    );
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    if (prismaError.code === 'P2002') {
      res.status(409).json(
        errorResponse('DUPLICATE_ENTRY', 'A record with this value already exists')
      );
      return;
    }
    
    if (prismaError.code === 'P2025') {
      res.status(404).json(
        errorResponse('NOT_FOUND', 'Record not found')
      );
      return;
    }
  }

  // Generic error
  res.status(500).json(
    errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
  );
};
