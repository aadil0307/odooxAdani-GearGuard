/// <reference types="node" />
import { PrismaClient, UserRole, RequestType, RequestStatus, EquipmentCategory, Department } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.maintenanceRequest.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.maintenanceTeam.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // ============================================================================
  // SEED USERS
  // ============================================================================
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@gearguard.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@gearguard.com',
      password: hashedPassword,
      name: 'John Manager',
      role: UserRole.MANAGER,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@gearguard.com',
      password: hashedPassword,
      name: 'Sarah Manager',
      role: UserRole.MANAGER,
    },
  });

  const techMech1 = await prisma.user.create({
    data: {
      email: 'tech.mech1@gearguard.com',
      password: hashedPassword,
      name: 'Mike Mechanic',
      role: UserRole.TECHNICIAN,
    },
  });

  const techMech2 = await prisma.user.create({
    data: {
      email: 'tech.mech2@gearguard.com',
      password: hashedPassword,
      name: 'Dave Mechanic',
      role: UserRole.TECHNICIAN,
    },
  });

  const techElec1 = await prisma.user.create({
    data: {
      email: 'tech.elec1@gearguard.com',
      password: hashedPassword,
      name: 'Lisa Electrician',
      role: UserRole.TECHNICIAN,
    },
  });

  const techElec2 = await prisma.user.create({
    data: {
      email: 'tech.elec2@gearguard.com',
      password: hashedPassword,
      name: 'Tom Electrician',
      role: UserRole.TECHNICIAN,
    },
  });

  const techIT = await prisma.user.create({
    data: {
      email: 'tech.it@gearguard.com',
      password: hashedPassword,
      name: 'Alex IT Specialist',
      role: UserRole.TECHNICIAN,
    },
  });

  const regularUser1 = await prisma.user.create({
    data: {
      email: 'user1@gearguard.com',
      password: hashedPassword,
      name: 'Bob Employee',
      role: UserRole.USER,
    },
  });

  const regularUser2 = await prisma.user.create({
    data: {
      email: 'user2@gearguard.com',
      password: hashedPassword,
      name: 'Jane Employee',
      role: UserRole.USER,
    },
  });

  console.log('✅ Created 10 users (1 admin, 2 managers, 5 technicians, 2 users)');

  // ============================================================================
  // SEED MAINTENANCE TEAMS
  // ============================================================================

  const mechanicalTeam = await prisma.maintenanceTeam.create({
    data: {
      name: 'Mechanical Team',
      description: 'Handles all mechanical equipment and machinery',
      members: {
        connect: [{ id: techMech1.id }, { id: techMech2.id }],
      },
    },
  });

  const electricalTeam = await prisma.maintenanceTeam.create({
    data: {
      name: 'Electrical Team',
      description: 'Handles electrical systems and wiring',
      members: {
        connect: [{ id: techElec1.id }, { id: techElec2.id }],
      },
    },
  });

  const itTeam = await prisma.maintenanceTeam.create({
    data: {
      name: 'IT Support Team',
      description: 'Handles computer hardware and IT infrastructure',
      members: {
        connect: [{ id: techIT.id }],
      },
    },
  });

  const facilitiesTeam = await prisma.maintenanceTeam.create({
    data: {
      name: 'Facilities Team',
      description: 'Handles HVAC, plumbing, and building maintenance',
      members: {
        connect: [{ id: techMech1.id }, { id: techElec1.id }],
      },
    },
  });

  console.log('✅ Created 4 maintenance teams');

  // ============================================================================
  // SEED EQUIPMENT
  // ============================================================================

  const equipment1 = await prisma.equipment.create({
    data: {
      name: 'CNC Milling Machine',
      serialNumber: 'CNC-2024-001',
      category: EquipmentCategory.MECHANICAL,
      department: Department.PRODUCTION,
      purchaseDate: new Date('2023-01-15'),
      warrantyExpiry: new Date('2025-01-15'),
      physicalLocation: 'Production Floor - Bay A1',
      assignedEmployeeId: regularUser1.id,
      defaultTeamId: mechanicalTeam.id,
      notes: 'High-precision milling machine, requires weekly calibration',
    },
  });

  const equipment2 = await prisma.equipment.create({
    data: {
      name: 'Industrial Generator',
      serialNumber: 'GEN-2023-042',
      category: EquipmentCategory.ELECTRICAL,
      department: Department.MAINTENANCE,
      purchaseDate: new Date('2023-06-20'),
      warrantyExpiry: new Date('2026-06-20'),
      physicalLocation: 'Generator Room - Building B',
      defaultTeamId: electricalTeam.id,
      notes: 'Backup power supply for entire facility',
    },
  });

  const equipment3 = await prisma.equipment.create({
    data: {
      name: 'Forklift Model X500',
      serialNumber: 'FRK-2022-018',
      category: EquipmentCategory.VEHICLES,
      department: Department.WAREHOUSE,
      purchaseDate: new Date('2022-03-10'),
      warrantyExpiry: new Date('2024-03-10'),
      physicalLocation: 'Warehouse - Loading Dock',
      assignedEmployeeId: regularUser2.id,
      defaultTeamId: mechanicalTeam.id,
      notes: 'Max capacity: 3 tons',
    },
  });

  const equipment4 = await prisma.equipment.create({
    data: {
      name: 'HVAC System - Central',
      serialNumber: 'HVAC-2021-001',
      category: EquipmentCategory.HVAC,
      department: Department.OTHER,
      purchaseDate: new Date('2021-08-01'),
      warrantyExpiry: new Date('2024-08-01'),
      physicalLocation: 'Rooftop - Main Building',
      defaultTeamId: facilitiesTeam.id,
      notes: 'Climate control for main production area',
    },
  });

  const equipment5 = await prisma.equipment.create({
    data: {
      name: 'Server Rack Dell R740',
      serialNumber: 'SRV-2024-005',
      category: EquipmentCategory.IT_HARDWARE,
      department: Department.IT,
      purchaseDate: new Date('2024-01-10'),
      warrantyExpiry: new Date('2027-01-10'),
      physicalLocation: 'Server Room - Floor 2',
      defaultTeamId: itTeam.id,
      notes: 'Primary application server',
    },
  });

  const equipment6 = await prisma.equipment.create({
    data: {
      name: 'Hydraulic Press',
      serialNumber: 'HYD-2020-012',
      category: EquipmentCategory.MECHANICAL,
      department: Department.PRODUCTION,
      purchaseDate: new Date('2020-05-15'),
      warrantyExpiry: new Date('2023-05-15'),
      physicalLocation: 'Production Floor - Bay C2',
      defaultTeamId: mechanicalTeam.id,
      isScrap: true,
      notes: 'SCRAPPED: Hydraulic system failure beyond repair',
    },
  });

  const equipment7 = await prisma.equipment.create({
    data: {
      name: 'Welding Robot ABB IRB 1600',
      serialNumber: 'WLD-2023-008',
      category: EquipmentCategory.MECHANICAL,
      department: Department.PRODUCTION,
      purchaseDate: new Date('2023-09-01'),
      warrantyExpiry: new Date('2026-09-01'),
      physicalLocation: 'Production Floor - Bay B3',
      defaultTeamId: mechanicalTeam.id,
      notes: 'Automated welding system',
    },
  });

  const equipment8 = await prisma.equipment.create({
    data: {
      name: 'Electric Pallet Jack',
      serialNumber: 'EPJ-2023-025',
      category: EquipmentCategory.VEHICLES,
      department: Department.WAREHOUSE,
      purchaseDate: new Date('2023-11-05'),
      warrantyExpiry: new Date('2025-11-05'),
      physicalLocation: 'Warehouse - Aisle 5',
      defaultTeamId: mechanicalTeam.id,
      notes: 'Battery-powered, charge nightly',
    },
  });

  console.log('✅ Created 8 equipment items (1 scrapped)');

  // ============================================================================
  // SEED MAINTENANCE REQUESTS
  // ============================================================================

  // Corrective Request - NEW
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'CNC Machine - Unusual Noise',
      description: 'The CNC machine is making a grinding noise during operation. Needs immediate inspection.',
      requestType: RequestType.CORRECTIVE,
      status: RequestStatus.NEW,
      equipmentId: equipment1.id,
      teamId: mechanicalTeam.id,
      createdById: regularUser1.id,
    },
  });

  // Corrective Request - IN PROGRESS
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'Generator - Not Starting',
      description: 'Emergency generator failed to start during weekly test. Battery might be dead.',
      requestType: RequestType.CORRECTIVE,
      status: RequestStatus.IN_PROGRESS,
      equipmentId: equipment2.id,
      teamId: electricalTeam.id,
      assignedToId: techElec1.id,
      createdById: manager1.id,
    },
  });

  // Corrective Request - REPAIRED
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'Forklift - Brake System Check',
      description: 'Brake pedal feels soft, needs inspection and possible fluid top-up.',
      requestType: RequestType.CORRECTIVE,
      status: RequestStatus.REPAIRED,
      equipmentId: equipment3.id,
      teamId: mechanicalTeam.id,
      assignedToId: techMech2.id,
      createdById: regularUser2.id,
      completedAt: new Date('2024-12-20'),
      durationHours: 1.5,
    },
  });

  // Preventive Request - Scheduled for Future
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'HVAC - Quarterly Filter Replacement',
      description: 'Routine quarterly maintenance: replace air filters and check refrigerant levels.',
      requestType: RequestType.PREVENTIVE,
      status: RequestStatus.NEW,
      scheduledDate: new Date('2025-01-15'),
      equipmentId: equipment4.id,
      teamId: facilitiesTeam.id,
      createdById: manager2.id,
    },
  });

  // Preventive Request - Scheduled for Today
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'Server - Monthly System Update',
      description: 'Apply security patches and perform system health check.',
      requestType: RequestType.PREVENTIVE,
      status: RequestStatus.IN_PROGRESS,
      scheduledDate: new Date('2024-12-27'),
      equipmentId: equipment5.id,
      teamId: itTeam.id,
      assignedToId: techIT.id,
      createdById: manager1.id,
    },
  });

  // Preventive Request - Completed
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'CNC Machine - Weekly Calibration',
      description: 'Weekly precision calibration and lubrication.',
      requestType: RequestType.PREVENTIVE,
      status: RequestStatus.REPAIRED,
      scheduledDate: new Date('2024-12-20'),
      equipmentId: equipment1.id,
      teamId: mechanicalTeam.id,
      assignedToId: techMech1.id,
      createdById: manager1.id,
      completedAt: new Date('2024-12-20'),
      durationHours: 0.75,
    },
  });

  // Corrective Request - Overdue (scheduled in past, not repaired)
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'Welding Robot - Arm Movement Error',
      description: 'Robot arm stops mid-operation with error code E402.',
      requestType: RequestType.CORRECTIVE,
      status: RequestStatus.IN_PROGRESS,
      equipmentId: equipment7.id,
      teamId: mechanicalTeam.id,
      assignedToId: techMech1.id,
      createdById: regularUser1.id,
      scheduledDate: new Date('2024-12-23'), // Overdue
    },
  });

  // Corrective Request - SCRAP (equipment beyond repair)
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'Hydraulic Press - Critical Failure',
      description: 'Hydraulic cylinder ruptured. Equipment deemed unsafe and beyond economical repair.',
      requestType: RequestType.CORRECTIVE,
      status: RequestStatus.SCRAP,
      equipmentId: equipment6.id,
      teamId: mechanicalTeam.id,
      assignedToId: techMech2.id,
      createdById: manager2.id,
      completedAt: new Date('2024-12-15'),
      durationHours: 2.0,
    },
  });

  // Preventive Request - Upcoming
  await prisma.maintenanceRequest.create({
    data: {
      subject: 'Pallet Jack - Battery Maintenance',
      description: 'Check battery health, clean terminals, and test charging system.',
      requestType: RequestType.PREVENTIVE,
      status: RequestStatus.NEW,
      scheduledDate: new Date('2025-01-05'),
      equipmentId: equipment8.id,
      teamId: mechanicalTeam.id,
      createdById: manager1.id,
    },
  });

  console.log('✅ Created 9 maintenance requests (various statuses)');

  // ============================================================================
  // SUMMARY
  // ============================================================================

  const userCount = await prisma.user.count();
  const teamCount = await prisma.maintenanceTeam.count();
  const equipmentCount = await prisma.equipment.count();
  const requestCount = await prisma.maintenanceRequest.count();

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${userCount}`);
  console.log(`   - Teams: ${teamCount}`);
  console.log(`   - Equipment: ${equipmentCount}`);
  console.log(`   - Maintenance Requests: ${requestCount}`);
  console.log('\n🔐 Test Credentials:');
  console.log('   - Admin: admin@gearguard.com / password123');
  console.log('   - Manager: manager1@gearguard.com / password123');
  console.log('   - Technician: tech.mech1@gearguard.com / password123');
  console.log('   - User: user1@gearguard.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
