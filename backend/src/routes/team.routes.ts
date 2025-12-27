import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireManagerOrAdmin, requireAdmin } from '../middleware/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/teams
 * @desc    Get all teams
 * @access  Protected
 */
router.get('/', teamController.getAllTeams);

/**
 * @route   GET /api/v1/teams/:id
 * @desc    Get team by ID
 * @access  Protected
 */
router.get('/:id', teamController.getTeamById);

/**
 * @route   POST /api/v1/teams
 * @desc    Create new team
 * @access  Manager/Admin only
 */
router.post('/', requireManagerOrAdmin, teamController.createTeam);

/**
 * @route   PUT /api/v1/teams/:id
 * @desc    Update team
 * @access  Manager/Admin only
 */
router.put('/:id', requireManagerOrAdmin, teamController.updateTeam);

/**
 * @route   DELETE /api/v1/teams/:id
 * @desc    Delete team
 * @access  Admin only
 */
router.delete('/:id', requireAdmin, teamController.deleteTeam);

/**
 * @route   POST /api/v1/teams/:id/members
 * @desc    Add member to team
 * @access  Manager/Admin only
 */
router.post('/:id/members', requireManagerOrAdmin, teamController.addMember);

/**
 * @route   DELETE /api/v1/teams/:id/members/:userId
 * @desc    Remove member from team
 * @access  Manager/Admin only
 */
router.delete('/:id/members/:userId', requireManagerOrAdmin, teamController.removeMember);

export default router;
