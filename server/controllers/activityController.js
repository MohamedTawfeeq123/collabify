const Activity = require('../models/Activity');
const Project = require('../models/Project');

/**
 * @desc    Get activity logs for a specific project
 * @route   GET /api/activities/project/:projectId
 * @access  Private
 */
const getProjectActivities = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const activities = await Activity.find({ project: projectId })
      .populate('user', 'fullName username profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent activity logs across all user's projects (for Dashboard)
 * @route   GET /api/activities/recent
 * @access  Private
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const userProjects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    }).select('_id');

    const projectIds = userProjects.map((p) => p._id);

    const activities = await Activity.find({ project: { $in: projectIds } })
      .populate('user', 'fullName username profilePicture')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectActivities,
  getRecentActivities
};
