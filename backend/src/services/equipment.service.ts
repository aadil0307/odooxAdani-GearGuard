import { EquipmentCategory, Department } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

interface EquipmentFilters {
  category?: EquipmentCategory;
  department?: Department;
  assignedEmployeeId?: string;
  isScrap?: boolean;
  search?: string;
}

interface Pagination {
  page: number;
  limit: number;
}

export const getAllEquipment = async (
  filters: EquipmentFilters,
  pagination: Pagination
) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.department) {
    where.department = filters.department;
  }

  if (filters.assignedEmployeeId) {
    where.assignedEmployeeId = filters.assignedEmployeeId;
  }

  if (filters.isScrap !== undefined) {
    where.isScrap = filters.isScrap;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { serialNumber: { contains: filters.search, mode: 'insensitive' } },
      { physicalLocation: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [equipment, total] = await Promise.all([
    prisma.equipment.findMany({
      where,
      skip,
      take: limit,
      include: {
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        defaultTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            maintenanceRequests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.equipment.count({ where }),
  ]);

  return {
    equipment,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEquipmentById = async (id: string) => {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      assignedEmployee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      defaultTeam: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      maintenanceRequests: {
        select: {
          id: true,
          subject: true,
          status: true,
          requestType: true,
          scheduledDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!equipment) {
    throw new NotFoundError('Equipment');
  }

  return equipment;
};

export const createEquipment = async (data: any) => {
  // Check if serial number already exists
  const existing = await prisma.equipment.findUnique({
    where: { serialNumber: data.serialNumber },
  });

  if (existing) {
    throw new ConflictError('Equipment with this serial number already exists');
  }

  // Validate dates
  const purchaseDate = new Date(data.purchaseDate);
  if (data.warrantyExpiry) {
    const warrantyExpiry = new Date(data.warrantyExpiry);
    if (warrantyExpiry < purchaseDate) {
      throw new ValidationError('Warranty expiry date cannot be before purchase date');
    }
  }

  const equipment = await prisma.equipment.create({
    data: {
      ...data,
      purchaseDate: new Date(data.purchaseDate),
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
    },
    include: {
      assignedEmployee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      defaultTeam: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return equipment;
};

export const updateEquipment = async (id: string, data: any) => {
  // Check if equipment exists
  const existing = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Equipment');
  }

  // If serial number is being updated, check uniqueness
  if (data.serialNumber && data.serialNumber !== existing.serialNumber) {
    const duplicate = await prisma.equipment.findUnique({
      where: { serialNumber: data.serialNumber },
    });

    if (duplicate) {
      throw new ConflictError('Equipment with this serial number already exists');
    }
  }

  // Validate dates
  if (data.purchaseDate && data.warrantyExpiry) {
    const purchaseDate = new Date(data.purchaseDate);
    const warrantyExpiry = new Date(data.warrantyExpiry);
    if (warrantyExpiry < purchaseDate) {
      throw new ValidationError('Warranty expiry date cannot be before purchase date');
    }
  }

  const updateData: any = { ...data };
  if (data.purchaseDate) {
    updateData.purchaseDate = new Date(data.purchaseDate);
  }
  if (data.warrantyExpiry) {
    updateData.warrantyExpiry = new Date(data.warrantyExpiry);
  }

  const equipment = await prisma.equipment.update({
    where: { id },
    data: updateData,
    include: {
      assignedEmployee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      defaultTeam: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return equipment;
};

export const deleteEquipment = async (id: string) => {
  // Check if equipment exists
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          maintenanceRequests: true,
        },
      },
    },
  });

  if (!equipment) {
    throw new NotFoundError('Equipment');
  }

  // Prevent deletion if there are active maintenance requests
  const activeRequests = await prisma.maintenanceRequest.count({
    where: {
      equipmentId: id,
      status: { in: ['NEW', 'IN_PROGRESS'] },
    },
  });

  if (activeRequests > 0) {
    throw new ValidationError(
      `Cannot delete equipment with ${activeRequests} active maintenance request(s). Mark as scrap instead.`
    );
  }

  await prisma.equipment.delete({
    where: { id },
  });

  return { message: 'Equipment deleted successfully' };
};

export const markAsScrap = async (id: string) => {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!equipment) {
    throw new NotFoundError('Equipment');
  }

  const updatedEquipment = await prisma.equipment.update({
    where: { id },
    data: { isScrap: true },
    include: {
      assignedEmployee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      defaultTeam: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedEquipment;
};

export const getMaintenanceHistory = async (id: string) => {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!equipment) {
    throw new NotFoundError('Equipment');
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where: { equipmentId: id },
    include: {
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
  });

  return {
    equipment: {
      id: equipment.id,
      name: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
    },
    requests,
    stats: {
      total: requests.length,
      corrective: requests.filter((r: any) => r.requestType === 'CORRECTIVE').length,
      preventive: requests.filter((r: any) => r.requestType === 'PREVENTIVE').length,
      repaired: requests.filter((r: any) => r.status === 'REPAIRED').length,
      active: requests.filter((r: any) => ['NEW', 'IN_PROGRESS'].includes(r.status)).length,
    },
  };
};
