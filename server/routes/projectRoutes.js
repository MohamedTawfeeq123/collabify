const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  inviteMember,
  updateMemberRole,
  updateMemberTeam,
  removeMember,
  getMyInvitations,
  respondToInvitation
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { validateProjectInput } = require('../middleware/validationMiddleware');

// Project invitation endpoints
router.get('/invitations/my', protect, getMyInvitations);
router.put('/invitations/:invitationId/respond', protect, respondToInvitation);

// Project member management endpoints
router.post('/:id/invite', protect, inviteMember);
router.put('/:id/members/:memberId/role', protect, updateMemberRole);
router.put('/:id/members/:memberId/team', protect, updateMemberTeam);
router.delete('/:id/members/:memberId', protect, removeMember);

// Standard Project CRUD endpoints
router.route('/')
  .post(protect, validateProjectInput, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, validateProjectInput, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
