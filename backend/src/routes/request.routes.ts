import { Router } from 'express';
import * as requestController from '../controllers/request.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrAdmin } from '../middleware/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/requests
 * @desc    Get all maintenance requests (filtered by role)
 * @access  Protected
 */
router.get('/', requestController.getAllRequests);

/**
 * @route   GET /api/v1/requests/calendar
 * @desc    Get calendar view of preventive maintenance requests
 * @access  Protected
 */
router.get('/calendar', requestController.getCalendarRequests);

/**
 * @route   GET /api/v1/requests/overdue
 * @desc    Get overdue maintenance requests
 * @access  Protected
 */
router.get('/overdue', requestController.getOverdueRequests);

/**
 * @route   GET /api/v1/requests/:id
 * @desc    Get maintenance request by ID
 * @access  Protected
 */
router.get('/:id', requestController.getRequestById);

/**
 * @route   POST /api/v1/requests
 * @desc    Create new maintenance request
 * @access  Protected (All users)
 */
router.post('/', requestController.createRequest);

/**
 * @route   PUT /api/v1/requests/:id
 * @desc    Update maintenance request
 * @access  Protected (Manager/Admin or assigned technician)
 */
router.put('/:id', requestController.updateRequest);

/**
 * @route   PATCH /api/v1/requests/:id/status
 * @desc    Update request status (workflow transitions)
 * @access  Protected (Manager/Admin or assigned technician)
 */
router.patch('/:id/status', requestController.updateRequestStatus);

/**
 * @route   PATCH /api/v1/requests/:id/assign
 * @desc    Assign technician to request
 * @access  Manager/Admin only
 */
router.patch('/:id/assign', requireManagerOrAdmin, requestController.assignTechnician);

export default router;
