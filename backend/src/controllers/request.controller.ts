import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as requestService from '../services/request.service';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';
import { RequestType, RequestStatus } from '@prisma/client';

const createRequestSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().optional().nullable(),
  requestType: z.nativeEnum(RequestType),
  equipmentId: z.string().min(1, 'Equipment ID is required'),
  scheduledDate: z.string().datetime().optional().nullable(),
  teamId: z.string().optional(), // Auto-filled from equipment if not provided
  assignedToId: z.string().optional().nullable(),
});

const updateRequestSchema = z.object({
  subject: z.string().min(5).optional(),
  description: z.string().optional().nullable(),
  scheduledDate: z.string().datetime().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  durationHours: z.number().positive().optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus),
  durationHours: z.number().positive().optional().nullable(),
});

export const getAllRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      status,
      requestType,
      equipmentId,
      teamId,
      assignedToId,
      createdById,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const filters = {
      status: status as RequestStatus | undefined,
      requestType: requestType as RequestType | undefined,
      equipmentId: equipmentId as string | undefined,
      teamId: teamId as string | undefined,
      assignedToId: assignedToId as string | undefined,
      createdById: createdById as string | undefined,
      search: search as string | undefined,
      userId: req.user?.userId,
      userRole: req.user?.role,
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await requestService.getAllRequests(filters, pagination);

    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const request = await requestService.getRequestById(id, req.user!);

    res.json(successResponse(request));
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createRequestSchema.parse(req.body);

    if (!validatedData.subject || !validatedData.requestType || !validatedData.equipmentId) {
      throw new ValidationError('Subject, request type, and equipment are required');
    }

    const request = await requestService.createRequest({
      ...validatedData,
      subject: validatedData.subject,
      requestType: validatedData.requestType,
      equipmentId: validatedData.equipmentId,
      createdById: req.user!.id,
      userRole: req.user!.role,
    } as any);

    res.status(201).json(
      successResponse(request, 'Maintenance request created successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const updateRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateRequestSchema.parse(req.body);

    const request = await requestService.updateRequest(id, validatedData, req.user!);

    res.json(
      successResponse(request, 'Request updated successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const updateRequestStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateStatusSchema.parse(req.body);

    const request = await requestService.updateRequestStatus(
      id,
      validatedData.status,
      req.user!,
      validatedData.durationHours
    );

    res.json(
      successResponse(request, 'Request status updated successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const assignTechnician = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    const request = await requestService.assignTechnician(id, technicianId, req.user!);

    res.json(
      successResponse(request, 'Technician assigned successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getCalendarRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ValidationError('startDate and endDate are required');
    }

    const requests = await requestService.getCalendarRequests(
      new Date(startDate as string),
      new Date(endDate as string),
      req.user!
    );

    res.json(successResponse(requests));
  } catch (error) {
    next(error);
  }
};

export const getOverdueRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const requests = await requestService.getOverdueRequests(req.user!);

    res.json(successResponse(requests));
  } catch (error) {
    next(error);
  }
};
