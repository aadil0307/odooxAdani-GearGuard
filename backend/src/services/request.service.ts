import { RequestType, RequestStatus, UserRole } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';
import { JwtPayload } from '../utils/jwt';

interface RequestFilters {
  status?: RequestStatus;
  requestType?: RequestType;
  equipmentId?: string;
  teamId?: string;
  assignedToId?: string;
  createdById?: string;
  search?: string;
  userId?: string;
  userRole?: string;
}

interface Pagination {
  page: number;
  limit: number;
}

export const getAllRequests = async (
  filters: RequestFilters,
  pagination: Pagination
) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Build where clause with role-based filtering
  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.requestType) {
    where.requestType = filters.requestType;
  }

  if (filters.equipmentId) {
    where.equipmentId = filters.equipmentId;
  }

  if (filters.teamId) {
    where.teamId = filters.teamId;
  }

  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  if (filters.search) {
    where.OR = [
      { subject: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Apply role-based access control
  if (filters.userRole === UserRole.USER) {
    // Regular users only see their own requests
    where.createdById = filters.userId;
  } else if (filters.userRole === UserRole.TECHNICIAN) {
    // Technicians see requests for their teams or assigned to them
    const userTeams = await prisma.maintenanceTeam.findMany({
      where: {
        members: {
          some: {
            id: filters.userId,
          },
        },
      },
      select: { id: true },
    });

    const teamIds = userTeams.map((t: any) => t.id);

    where.OR = [
      { assignedToId: filters.userId },
      { teamId: { in: teamIds } },
    ];
  }
  // Managers and Admins see all requests (no filter needed)

  const [requests, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      skip,
      take: limit,
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            category: true,
            isScrap: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getRequestById = async (id: string, user: JwtPayload) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          category: true,
          department: true,
          physicalLocation: true,
          isScrap: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          description: true,
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!request) {
    throw new NotFoundError('Maintenance request');
  }

  // Check access permissions
  if (user.role === UserRole.USER && request.createdById !== user.userId) {
    throw new ForbiddenError('You can only view your own requests');
  }

  if (user.role === UserRole.TECHNICIAN) {
    // Check if technician is in the team or assigned to the request
    const isMember = request.team.members.some((m: any) => m.id === user.userId);
    const isAssigned = request.assignedToId === user.userId;

    if (!isMember && !isAssigned) {
      throw new ForbiddenError('You do not have access to this request');
    }
  }

  return request;
};

export const createRequest = async (data: {
  subject: string;
  description?: string | null;
  requestType: RequestType;
  equipmentId: string;
  scheduledDate?: string | null;
  teamId?: string;
  assignedToId?: string | null;
  createdById: string;
  userRole: string;
}) => {
  // Get equipment details
  const equipment = await prisma.equipment.findUnique({
    where: { id: data.equipmentId },
    include: {
      defaultTeam: true,
    },
  });

  if (!equipment) {
    throw new NotFoundError('Equipment');
  }

  // Prevent requests for scrapped equipment
  if (equipment.isScrap) {
    throw new ValidationError('Cannot create maintenance request for scrapped equipment');
  }

  // Auto-fill team from equipment if not provided
  const teamId = data.teamId || equipment.defaultTeamId;

  if (!teamId) {
    throw new ValidationError(
      'Equipment does not have a default maintenance team. Please specify a team.'
    );
  }

  // Validate team exists
  const team = await prisma.maintenanceTeam.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new NotFoundError('Maintenance team');
  }

  // Validate scheduled date for preventive maintenance
  if (data.requestType === RequestType.PREVENTIVE && !data.scheduledDate) {
    throw new ValidationError('Scheduled date is required for preventive maintenance');
  }

  // Only managers and admins can create preventive requests
  if (
    data.requestType === RequestType.PREVENTIVE &&
    ![UserRole.ADMIN, UserRole.MANAGER].includes(data.userRole as any)
  ) {
    throw new ForbiddenError('Only managers and admins can create preventive maintenance requests');
  }

  // Validate assigned technician if provided
  if (data.assignedToId) {
    const technician = await prisma.user.findUnique({
      where: { id: data.assignedToId },
      include: {
        teams: {
          where: { id: teamId },
        },
      },
    });

    if (!technician) {
      throw new NotFoundError('Technician');
    }

    if (technician.teams.length === 0) {
      throw new ValidationError('Assigned technician is not a member of the selected team');
    }

    if (
      ![UserRole.TECHNICIAN, UserRole.MANAGER, UserRole.ADMIN].includes(technician.role as any)
    ) {
      throw new ValidationError('Assigned user must have TECHNICIAN, MANAGER, or ADMIN role');
    }
  }

  const request = await prisma.maintenanceRequest.create({
    data: {
      subject: data.subject,
      description: data.description,
      requestType: data.requestType,
      status: RequestStatus.NEW,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      equipmentId: data.equipmentId,
      teamId,
      assignedToId: data.assignedToId,
      createdById: data.createdById,
    },
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          category: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return request;
};

export const updateRequest = async (
  id: string,
  data: {
    subject?: string;
    description?: string | null;
    scheduledDate?: string | null;
    assignedToId?: string | null;
    durationHours?: number | null;
  },
  user: JwtPayload
) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      team: {
        include: {
          members: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!request) {
    throw new NotFoundError('Maintenance request');
  }

  // Check permissions
  const isAdmin = user.role === UserRole.ADMIN;
  const isManager = user.role === UserRole.MANAGER;
  const isAssigned = request.assignedToId === user.userId;
  // const isCreator = request.createdById === user.userId;

  if (!isAdmin && !isManager && !isAssigned) {
    throw new ForbiddenError('You do not have permission to update this request');
  }

  // Validate assigned technician if being changed
  if (data.assignedToId !== undefined) {
    if (data.assignedToId) {
      const technician = await prisma.user.findUnique({
        where: { id: data.assignedToId },
        include: {
          teams: {
            where: { id: request.teamId },
          },
        },
      });

      if (!technician) {
        throw new NotFoundError('Technician');
      }

      if (technician.teams.length === 0) {
        throw new ValidationError('Assigned technician is not a member of the request team');
      }
    }
  }

  const updateData: any = {};

  if (data.subject !== undefined) updateData.subject = data.subject;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.scheduledDate !== undefined)
    updateData.scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
  if (data.durationHours !== undefined) updateData.durationHours = data.durationHours;

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id },
    data: updateData,
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          category: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedRequest;
};

export const updateRequestStatus = async (
  id: string,
  status: RequestStatus,
  user: JwtPayload,
  durationHours?: number | null
) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      equipment: true,
    },
  });

  if (!request) {
    throw new NotFoundError('Maintenance request');
  }

  // Check permissions
  const isAdmin = user.role === UserRole.ADMIN;
  const isManager = user.role === UserRole.MANAGER;
  const isAssigned = request.assignedToId === user.userId;

  if (!isAdmin && !isManager && !isAssigned) {
    throw new ForbiddenError('You do not have permission to update this request status');
  }

  // Validate status transitions
  const validTransitions: Record<RequestStatus, RequestStatus[]> = {
    [RequestStatus.NEW]: [RequestStatus.IN_PROGRESS, RequestStatus.SCRAP],
    [RequestStatus.IN_PROGRESS]: [RequestStatus.REPAIRED, RequestStatus.SCRAP],
    [RequestStatus.REPAIRED]: [], // Terminal state
    [RequestStatus.SCRAP]: [], // Terminal state
  };

  if (!validTransitions[request.status].includes(status)) {
    throw new ValidationError(
      `Invalid status transition from ${request.status} to ${status}`
    );
  }

  // Validate completion requirements
  if (status === RequestStatus.REPAIRED) {
    if (!durationHours || durationHours <= 0) {
      throw new ValidationError('Duration hours is required when marking request as repaired');
    }

    if (!request.assignedToId) {
      throw new ValidationError('Request must be assigned to a technician before marking as repaired');
    }
  }

  const updateData: any = {
    status,
  };

  if (status === RequestStatus.REPAIRED || status === RequestStatus.SCRAP) {
    updateData.completedAt = new Date();
    if (durationHours) {
      updateData.durationHours = durationHours;
    }
  }

  // If status is IN_PROGRESS and no technician assigned, assign to current user
  if (status === RequestStatus.IN_PROGRESS && !request.assignedToId) {
    updateData.assignedToId = user.userId;
  }

  // If marking as SCRAP, also mark equipment as scrap
  if (status === RequestStatus.SCRAP) {
    await prisma.equipment.update({
      where: { id: request.equipmentId },
      data: { isScrap: true },
    });
  }

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id },
    data: updateData,
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          category: true,
          isScrap: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedRequest;
};

export const assignTechnician = async (
  id: string,
  technicianId: string,
  user: JwtPayload
) => {
  // Only managers and admins can assign technicians
  if (![UserRole.ADMIN, UserRole.MANAGER].includes(user.role as any)) {
    throw new ForbiddenError('Only managers and admins can assign technicians');
  }

  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      team: true,
    },
  });

  if (!request) {
    throw new NotFoundError('Maintenance request');
  }

  // Validate technician
  const technician = await prisma.user.findUnique({
    where: { id: technicianId },
    include: {
      teams: {
        where: { id: request.teamId },
      },
    },
  });

  if (!technician) {
    throw new NotFoundError('Technician');
  }

  if (technician.teams.length === 0) {
    throw new ValidationError('Technician is not a member of the request team');
  }

  if (![UserRole.TECHNICIAN, UserRole.MANAGER, UserRole.ADMIN].includes(technician.role as any)) {
    throw new ValidationError('User must have TECHNICIAN, MANAGER, or ADMIN role');
  }

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      assignedToId: technicianId,
      status: request.status === RequestStatus.NEW ? RequestStatus.IN_PROGRESS : request.status,
    },
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          category: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedRequest;
};

export const getCalendarRequests = async (
  startDate: Date,
  endDate: Date,
  user: JwtPayload
) => {
  const where: any = {
    requestType: RequestType.PREVENTIVE,
    scheduledDate: {
      gte: startDate,
      lte: endDate,
    },
  };

  // Apply role-based filtering
  if (user.role === UserRole.USER) {
    where.createdById = user.userId;
  } else if (user.role === UserRole.TECHNICIAN) {
    const userTeams = await prisma.maintenanceTeam.findMany({
      where: {
        members: {
          some: {
            id: user.userId,
          },
        },
      },
      select: { id: true },
    });

    const teamIds = userTeams.map((t) => t.id);

    where.OR = [{ assignedToId: user.userId }, { teamId: { in: teamIds } }];
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where,
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          category: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  return requests;
};

export const getOverdueRequests = async (user: JwtPayload) => {
  const now = new Date();

  const where: any = {
    scheduledDate: {
      lt: now,
    },
    status: {
      notIn: [RequestStatus.REPAIRED, RequestStatus.SCRAP],
    },
  };

  // Apply role-based filtering
  if (user.role === UserRole.USER) {
    where.createdById = user.userId;
  } else if (user.role === UserRole.TECHNICIAN) {
    const userTeams = await prisma.maintenanceTeam.findMany({
      where: {
        members: {
          some: {
            id: user.userId,
          },
        },
      },
      select: { id: true },
    });

    const teamIds = userTeams.map((t) => t.id);

    where.OR = [{ assignedToId: user.userId }, { teamId: { in: teamIds } }];
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where,
    include: {
      equipment: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          category: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  return requests;
};
