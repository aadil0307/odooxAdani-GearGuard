import { RequestStatus, UserRole } from '@prisma/client';
import prisma from '../config/database';
import { JwtPayload } from '../utils/jwt';

interface DateFilters {
  startDate?: Date;
  endDate?: Date;
}

export const getRequestsByTeam = async (filters: DateFilters) => {
  const where: any = {};

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const requests = await prisma.maintenanceRequest.groupBy({
    by: ['teamId'],
    where,
    _count: {
      id: true,
    },
  });

  // Get team details
  const teamsData = await Promise.all(
    requests.map(async (r) => {
      const team = await prisma.maintenanceTeam.findUnique({
        where: { id: r.teamId },
        select: {
          id: true,
          name: true,
        },
      });

      return {
        teamId: r.teamId,
        teamName: team?.name || 'Unknown',
        totalRequests: r._count.id,
      };
    })
  );

  // Get status breakdown for each team
  const detailedData = await Promise.all(
    teamsData.map(async (team) => {
      const statusBreakdown = await prisma.maintenanceRequest.groupBy({
        by: ['status'],
        where: {
          teamId: team.teamId,
          ...(filters.startDate || filters.endDate ? { createdAt: where.createdAt } : {}),
        },
        _count: {
          id: true,
        },
      });

      const breakdown: Record<string, number> = {};
      statusBreakdown.forEach((s) => {
        breakdown[s.status] = s._count.id;
      });

      return {
        ...team,
        statusBreakdown: breakdown,
      };
    })
  );

  return {
    teams: detailedData,
    total: requests.reduce((sum, r) => sum + r._count.id, 0),
  };
};

export const getRequestsByCategory = async (filters: DateFilters) => {
  const where: any = {};

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where,
    select: {
      equipment: {
        select: {
          category: true,
        },
      },
      status: true,
      requestType: true,
    },
  });

  // Group by category
  const categoryMap = new Map<string, any>();

  requests.forEach((req) => {
    const category = req.equipment.category;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        totalRequests: 0,
        corrective: 0,
        preventive: 0,
        new: 0,
        inProgress: 0,
        repaired: 0,
        scrap: 0,
      });
    }

    const data = categoryMap.get(category);
    data.totalRequests++;

    if (req.requestType === 'CORRECTIVE') data.corrective++;
    if (req.requestType === 'PREVENTIVE') data.preventive++;

    if (req.status === 'NEW') data.new++;
    if (req.status === 'IN_PROGRESS') data.inProgress++;
    if (req.status === 'REPAIRED') data.repaired++;
    if (req.status === 'SCRAP') data.scrap++;
  });

  return {
    categories: Array.from(categoryMap.values()),
    total: requests.length,
  };
};

export const getRequestsByStatus = async (filters: DateFilters) => {
  const where: any = {};

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const statusCounts = await prisma.maintenanceRequest.groupBy({
    by: ['status'],
    where,
    _count: {
      id: true,
    },
  });

  const total = statusCounts.reduce((sum, s) => sum + s._count.id, 0);

  const data = statusCounts.map((s) => ({
    status: s.status,
    count: s._count.id,
    percentage: total > 0 ? ((s._count.id / total) * 100).toFixed(2) : '0.00',
  }));

  return {
    statusDistribution: data,
    total,
  };
};

export const getDurationAnalysis = async (filters: DateFilters) => {
  const where: any = {
    status: RequestStatus.REPAIRED,
    durationHours: {
      not: null,
    },
  };

  if (filters.startDate || filters.endDate) {
    where.completedAt = {};
    if (filters.startDate) where.completedAt.gte = filters.startDate;
    if (filters.endDate) where.completedAt.lte = filters.endDate;
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where,
    select: {
      durationHours: true,
      requestType: true,
      equipment: {
        select: {
          category: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (requests.length === 0) {
    return {
      overall: {
        totalRequests: 0,
        totalHours: 0,
        averageHours: 0,
        minHours: 0,
        maxHours: 0,
      },
      byType: {},
      byCategory: {},
      byTeam: {},
    };
  }

  const durations = requests.map((r) => r.durationHours!);
  const totalHours = durations.reduce((sum, d) => sum + d, 0);
  const averageHours = totalHours / durations.length;
  const minHours = Math.min(...durations);
  const maxHours = Math.max(...durations);

  // By type
  const byType: any = {};
  requests.forEach((r) => {
    const type = r.requestType;
    if (!byType[type]) {
      byType[type] = { count: 0, totalHours: 0, averageHours: 0 };
    }
    byType[type].count++;
    byType[type].totalHours += r.durationHours!;
  });

  Object.keys(byType).forEach((type) => {
    byType[type].averageHours = byType[type].totalHours / byType[type].count;
  });

  // By category
  const byCategory: any = {};
  requests.forEach((r) => {
    const category = r.equipment.category;
    if (!byCategory[category]) {
      byCategory[category] = { count: 0, totalHours: 0, averageHours: 0 };
    }
    byCategory[category].count++;
    byCategory[category].totalHours += r.durationHours!;
  });

  Object.keys(byCategory).forEach((category) => {
    byCategory[category].averageHours = byCategory[category].totalHours / byCategory[category].count;
  });

  // By team
  const byTeam: any = {};
  requests.forEach((r) => {
    const teamId = r.team.id;
    const teamName = r.team.name;
    if (!byTeam[teamId]) {
      byTeam[teamId] = { teamName, count: 0, totalHours: 0, averageHours: 0 };
    }
    byTeam[teamId].count++;
    byTeam[teamId].totalHours += r.durationHours!;
  });

  Object.keys(byTeam).forEach((teamId) => {
    byTeam[teamId].averageHours = byTeam[teamId].totalHours / byTeam[teamId].count;
  });

  return {
    overall: {
      totalRequests: requests.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      averageHours: parseFloat(averageHours.toFixed(2)),
      minHours: parseFloat(minHours.toFixed(2)),
      maxHours: parseFloat(maxHours.toFixed(2)),
    },
    byType,
    byCategory,
    byTeam: Object.values(byTeam),
  };
};

export const getDashboardStats = async (user: JwtPayload) => {
  const now = new Date();

  // Build where clause based on role
  let requestWhere: any = {};

  if (user.role === UserRole.USER) {
    requestWhere.createdById = user.userId;
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
    requestWhere.OR = [{ assignedToId: user.userId }, { teamId: { in: teamIds } }];
  }

  // Get counts
  const [
    totalRequests,
    newRequests,
    inProgressRequests,
    repairedRequests,
    overdueRequests,
    totalEquipment,
    scrapEquipment,
    totalTeams,
  ] = await Promise.all([
    prisma.maintenanceRequest.count({ where: requestWhere }),
    prisma.maintenanceRequest.count({
      where: { ...requestWhere, status: RequestStatus.NEW },
    }),
    prisma.maintenanceRequest.count({
      where: { ...requestWhere, status: RequestStatus.IN_PROGRESS },
    }),
    prisma.maintenanceRequest.count({
      where: { ...requestWhere, status: RequestStatus.REPAIRED },
    }),
    prisma.maintenanceRequest.count({
      where: {
        ...requestWhere,
        scheduledDate: { lt: now },
        status: { notIn: [RequestStatus.REPAIRED, RequestStatus.SCRAP] },
      },
    }),
    user.role === UserRole.USER ? 0 : prisma.equipment.count(),
    user.role === UserRole.USER ? 0 : prisma.equipment.count({ where: { isScrap: true } }),
    user.role === UserRole.USER ? 0 : prisma.maintenanceTeam.count(),
  ]);

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentRequests = await prisma.maintenanceRequest.count({
    where: {
      ...requestWhere,
      createdAt: { gte: sevenDaysAgo },
    },
  });

  // My active tasks (for technicians)
  let myActiveTasks = 0;
  if ([UserRole.TECHNICIAN, UserRole.MANAGER, UserRole.ADMIN].includes(user.role as any)) {
    myActiveTasks = await prisma.maintenanceRequest.count({
      where: {
        assignedToId: user.userId,
        status: { in: [RequestStatus.NEW, RequestStatus.IN_PROGRESS] },
      },
    });
  }

  return {
    requests: {
      total: totalRequests,
      new: newRequests,
      inProgress: inProgressRequests,
      repaired: repairedRequests,
      overdue: overdueRequests,
      recentlyCreated: recentRequests,
    },
    equipment: {
      total: totalEquipment,
      scrap: scrapEquipment,
      active: totalEquipment - scrapEquipment,
    },
    teams: {
      total: totalTeams,
    },
    myTasks: {
      active: myActiveTasks,
    },
  };
};
