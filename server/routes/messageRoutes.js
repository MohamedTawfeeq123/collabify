const express = require('express');
const router = express.Router();
const {
  getProjectMessages,
  sendMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:projectId')
  .get(protect, getProjectMessages)
  .post(protect, sendMessage);

module.exports = router;
