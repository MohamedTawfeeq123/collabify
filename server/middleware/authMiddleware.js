const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

/**
 * Authentication Middleware
 * Validates JWT token from the Authorization header (Bearer <token>)
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'collabify_super_secret_jwt_key_2026_production'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists. Please log in again.'
        });
      }

      return next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

/**
 * Role-Based Access Middleware for Projects
 * Checks if user is Owner or has one of the allowed roles in the project.
 */
const checkProjectAccess = (allowedRoles = ['Owner', 'Admin', 'Member', 'Viewer']) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.params.id || req.body.project;
      if (!projectId) {
        return res.status(400).json({ success: false, message: 'Project ID is required' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // Check if user is the Owner
      if (project.owner.toString() === req.user._id.toString()) {
        req.project = project;
        req.userRole = 'Owner';
        return next();
      }

      // Check member role
      const member = project.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not a member of this project'
        });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Requires one of [${allowedRoles.join(', ')}] permissions`
        });
      }

      req.project = project;
      req.userRole = member.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { protect, checkProjectAccess };
