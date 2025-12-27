import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as teamService from '../services/team.service';
import { successResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';

const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  memberIds: z.array(z.string()).optional(),
});

const updateTeamSchema = createTeamSchema.partial();

export const getAllTeams = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { isActive, search } = req.query;

    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search: search as string | undefined,
    };

    const teams = await teamService.getAllTeams(filters);

    res.json(successResponse(teams));
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const team = await teamService.getTeamById(id);

    res.json(successResponse(team));
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createTeamSchema.parse(req.body);

    // Ensure name is present (Zod should validate this, but TS needs explicit check)
    if (!validatedData.name) {
      throw new ValidationError('Team name is required');
    }

    const team = await teamService.createTeam(validatedData as { name: string; description?: string; memberIds?: string[] });

    res.status(201).json(
      successResponse(team, 'Team created successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const updateTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateTeamSchema.parse(req.body);

    const team = await teamService.updateTeam(id, validatedData);

    res.json(
      successResponse(team, 'Team updated successfully')
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new ValidationError('Validation failed', error.errors));
    } else {
      next(error);
    }
  }
};

export const deleteTeam = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await teamService.deleteTeam(id);

    res.json(
      successResponse(null, 'Team deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const addMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      throw new ValidationError('userId is required');
    }

    const team = await teamService.addMember(id, userId);

    res.json(
      successResponse(team, 'Member added successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, userId } = req.params;

    const team = await teamService.removeMember(id, userId);

    res.json(
      successResponse(team, 'Member removed successfully')
    );
  } catch (error) {
    next(error);
  }
};
