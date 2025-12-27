import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

interface TeamFilters {
  isActive?: boolean;
  search?: string;
}

export const getAllTeams = async (filters: TeamFilters) => {
  const where: any = {};

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const teams = await prisma.maintenanceTeam.findMany({
    where,
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          maintenanceRequests: true,
          defaultForEquipment: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return teams;
};

export const getTeamById = async (id: string) => {
  const team = await prisma.maintenanceTeam.findUnique({
    where: { id },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      maintenanceRequests: {
        where: {
          status: { in: ['NEW', 'IN_PROGRESS'] },
        },
        select: {
          id: true,
          subject: true,
          status: true,
          requestType: true,
          equipment: {
            select: {
              id: true,
              name: true,
              serialNumber: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      defaultForEquipment: {
        select: {
          id: true,
          name: true,
          serialNumber: true,
          category: true,
        },
        take: 10,
      },
    },
  });

  if (!team) {
    throw new NotFoundError('Team');
  }

  return team;
};

export const createTeam = async (data: {
  name: string;
  description?: string | null;
  memberIds?: string[];
}) => {
  // Check if team name already exists
  const existing = await prisma.maintenanceTeam.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new ConflictError('Team with this name already exists');
  }

  // Validate members are technicians
  if (data.memberIds && data.memberIds.length > 0) {
    const members = await prisma.user.findMany({
      where: {
        id: { in: data.memberIds },
      },
    });

    const nonTechnicians = members.filter(
      (m) => ![UserRole.TECHNICIAN, UserRole.MANAGER, UserRole.ADMIN].includes(m.role as any)
    );

    if (nonTechnicians.length > 0) {
      throw new ValidationError(
        'Only users with TECHNICIAN, MANAGER, or ADMIN roles can be team members'
      );
    }
  }

  const team = await prisma.maintenanceTeam.create({
    data: {
      name: data.name,
      description: data.description,
      members: data.memberIds
        ? {
            connect: data.memberIds.map((id) => ({ id })),
          }
        : undefined,
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return team;
};

export const updateTeam = async (
  id: string,
  data: {
    name?: string;
    description?: string | null;
    isActive?: boolean;
    memberIds?: string[];
  }
) => {
  const existing = await prisma.maintenanceTeam.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Team');
  }

  // Check name uniqueness if updating
  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.maintenanceTeam.findUnique({
      where: { name: data.name },
    });

    if (duplicate) {
      throw new ConflictError('Team with this name already exists');
    }
  }

  // Validate members if provided
  if (data.memberIds && data.memberIds.length > 0) {
    const members = await prisma.user.findMany({
      where: {
        id: { in: data.memberIds },
      },
    });

    const nonTechnicians = members.filter(
      (m) => ![UserRole.TECHNICIAN, UserRole.MANAGER, UserRole.ADMIN].includes(m.role as any)
    );

    if (nonTechnicians.length > 0) {
      throw new ValidationError(
        'Only users with TECHNICIAN, MANAGER, or ADMIN roles can be team members'
      );
    }
  }

  const updateData: any = {
    name: data.name,
    description: data.description,
    isActive: data.isActive,
  };

  if (data.memberIds !== undefined) {
    updateData.members = {
      set: data.memberIds.map((id: string) => ({ id })),
    };
  }

  const team = await prisma.maintenanceTeam.update({
    where: { id },
    data: updateData,
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return team;
};

export const deleteTeam = async (id: string) => {
  const team = await prisma.maintenanceTeam.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          maintenanceRequests: true,
        },
      },
    },
  });

  if (!team) {
    throw new NotFoundError('Team');
  }

  // Check for active requests
  const activeRequests = await prisma.maintenanceRequest.count({
    where: {
      teamId: id,
      status: { in: ['NEW', 'IN_PROGRESS'] },
    },
  });

  if (activeRequests > 0) {
    throw new ValidationError(
      `Cannot delete team with ${activeRequests} active maintenance request(s)`
    );
  }

  await prisma.maintenanceTeam.delete({
    where: { id },
  });

  return { message: 'Team deleted successfully' };
};

export const addMember = async (teamId: string, userId: string) => {
  const [team, user] = await Promise.all([
    prisma.maintenanceTeam.findUnique({ where: { id: teamId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!team) {
    throw new NotFoundError('Team');
  }

  if (!user) {
    throw new NotFoundError('User');
  }

  if (![UserRole.TECHNICIAN, UserRole.MANAGER, UserRole.ADMIN].includes(user.role as any)) {
    throw new ValidationError(
      'Only users with TECHNICIAN, MANAGER, or ADMIN roles can be team members'
    );
  }

  const updatedTeam = await prisma.maintenanceTeam.update({
    where: { id: teamId },
    data: {
      members: {
        connect: { id: userId },
      },
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return updatedTeam;
};

export const removeMember = async (teamId: string, userId: string) => {
  const team = await prisma.maintenanceTeam.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new NotFoundError('Team');
  }

  // Unassign all active requests from the member before removal
  // The requests remain with the team but are unassigned
  await prisma.maintenanceRequest.updateMany({
    where: {
      teamId,
      assignedToId: userId,
      status: { in: ['NEW', 'IN_PROGRESS'] },
    },
    data: {
      assignedToId: null,
    },
  });

  const updatedTeam = await prisma.maintenanceTeam.update({
    where: { id: teamId },
    data: {
      members: {
        disconnect: { id: userId },
      },
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return updatedTeam;
};
