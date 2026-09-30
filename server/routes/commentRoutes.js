const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { validateCommentInput } = require('../middleware/validationMiddleware');

// Nested task comment routes: /api/tasks/:taskId/comments
router.route('/')
  .post(protect, validateCommentInput, createComment)
  .get(protect, getTaskComments);

// Direct comment routes: /api/comments/:id
router.route('/:id')
  .put(protect, validateCommentInput, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
