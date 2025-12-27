import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as equipmentService from '../services/equipment.service';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';
import { EquipmentCategory, Department } from '@prisma/client';

// Validation schemas
const createEquipmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  category: z.nativeEnum(EquipmentCategory),
  department: z.nativeEnum(Department),
  purchaseDate: z.string().datetime(),
  warrantyExpiry: z.string().datetime().optional().nullable(),
  physicalLocation: z.string().min(1, 'Physical location is required'),
  assignedEmployeeId: z.string().optional().nullable(),
  defaultTeamId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateEquipmentSchema = createEquipmentSchema.partial().extend({
  isScrap: z.boolean().optional(),
});

export const getAllEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      category,
      department,
      assignedEmployeeId,
      isScrap,
      search,
      page = '1',
      limit = '10',
    } = req.query;

    const filters = {
      category: category as EquipmentCategory | undefined,
      department: department as Department | undefined,
      assignedEmployeeId: assignedEmployeeId as string | undefined,
      isScrap: isScrap === 'true' ? true : isScrap === 'false' ? false : undefined,
      search: search as string | undefined,
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    };

    const result = await equipmentService.getAllEquipment(filters, pagination);

    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getEquipmentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const equipment = await equipmentService.getEquipmentById(id);

    res.json(successResponse(equipment));
  } catch (error) {
    next(error);
  }
};

export const createEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createEquipmentSchema.parse(req.body);

    const equipment = await equipmentService.createEquipment(validatedData);

    res.status(201).json(
      successResponse(equipment, 'Equipment created successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const updateEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateEquipmentSchema.parse(req.body);

    const equipment = await equipmentService.updateEquipment(id, validatedData);

    res.json(
      successResponse(equipment, 'Equipment updated successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const deleteEquipment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await equipmentService.deleteEquipment(id);

    res.json(
      successResponse(null, 'Equipment deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const markAsScrap = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const equipment = await equipmentService.markAsScrap(id);

    res.json(
      successResponse(equipment, 'Equipment marked as scrap')
    );
  } catch (error) {
    next(error);
  }
};

export const getEquipmentMaintenanceHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const history = await equipmentService.getMaintenanceHistory(id);

    res.json(successResponse(history));
  } catch (error) {
    next(error);
  }
};
