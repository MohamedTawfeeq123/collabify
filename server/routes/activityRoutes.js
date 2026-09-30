const express = require('express');
const router = express.Router();
const {
  getProjectActivities,
  getRecentActivities
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recent', protect, getRecentActivities);
router.get('/project/:projectId', protect, getProjectActivities);

module.exports = router;
