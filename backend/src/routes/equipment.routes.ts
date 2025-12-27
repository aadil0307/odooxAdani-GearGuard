import { Router } from 'express';
import * as equipmentController from '../controllers/equipment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrAdmin, requireAdmin, requireTechnicianOrAbove } from '../middleware/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/equipment
 * @desc    Get all equipment with filters and pagination
 * @access  Protected
 */
router.get('/', equipmentController.getAllEquipment);

/**
 * @route   GET /api/v1/equipment/:id
 * @desc    Get equipment by ID
 * @access  Protected
 */
router.get('/:id', equipmentController.getEquipmentById);

/**
 * @route   GET /api/v1/equipment/:id/maintenance-history
 * @desc    Get maintenance history for equipment
 * @access  Protected
 */
router.get('/:id/maintenance-history', equipmentController.getEquipmentMaintenanceHistory);

/**
 * @route   POST /api/v1/equipment
 * @desc    Create new equipment
 * @access  Technician and above
 */
router.post('/', requireTechnicianOrAbove, equipmentController.createEquipment);

/**
 * @route   PUT /api/v1/equipment/:id
 * @desc    Update equipment
 * @access  Technician and above
 */
router.put('/:id', requireTechnicianOrAbove, equipmentController.updateEquipment);

/**
 * @route   PATCH /api/v1/equipment/:id/scrap
 * @desc    Mark equipment as scrap
 * @access  Manager/Admin only
 */
router.patch('/:id/scrap', requireManagerOrAdmin, equipmentController.markAsScrap);

/**
 * @route   DELETE /api/v1/equipment/:id
 * @desc    Delete equipment
 * @access  Admin only
 */
router.delete('/:id', requireAdmin, equipmentController.deleteEquipment);

export default router;
