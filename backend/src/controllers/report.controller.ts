import { Response, NextFunction } from 'express';
import * as reportService from '../services/report.service';
import { successResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types/express';

export const getRequestsByTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const report = await reportService.getRequestsByTeam(filters);

    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getRequestsByCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const report = await reportService.getRequestsByCategory(filters);

    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getRequestsByStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const report = await reportService.getRequestsByStatus(filters);

    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getDurationAnalysis = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const report = await reportService.getDurationAnalysis(filters);

    res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await reportService.getDashboardStats(req.user!);

    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};
