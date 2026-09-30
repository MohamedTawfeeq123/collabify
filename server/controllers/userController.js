const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const {
  validateName,
  validateUsername,
  validateDescription,
  validateEmployeeId
} = require('../utils/validators');

// Escape user input before using it inside a RegExp (prevents crashes / ReDoS)
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Get user profile with stats
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate user's project and task stats
    const totalProjects = await Project.countDocuments({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    });

    const totalTasks = await Task.countDocuments({
      assignedTo: req.user._id
    });

    const completedTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: 'Completed'
    });

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          totalProjects,
          totalTasks,
          completedTasks
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, username, bio, profilePicture, theme, employeeId, department, designation } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) {
      const nameError = validateName(fullName, 'Full Name');
      if (nameError) return res.status(400).json({ success: false, message: nameError });
      user.fullName = fullName.trim();
    }

    if (username && username.toLowerCase().trim() !== user.username) {
      const normalizedUsername = username.toLowerCase().trim();
      const usernameError = validateUsername(normalizedUsername);
      if (usernameError) return res.status(400).json({ success: false, message: usernameError });

      const existing = await User.findOne({ username: normalizedUsername });
      if (existing) {
        return res.status(400).json({ success: false, message: 'This username is already taken.' });
      }
      user.username = normalizedUsername;
    }

    if (employeeId !== undefined && employeeId.trim().toUpperCase() !== (user.employeeId || '')) {
      const idError = validateEmployeeId(employeeId, false);
      if (idError) return res.status(400).json({ success: false, message: idError });

      const normalizedId = employeeId.trim().toUpperCase();
      if (normalizedId) {
        const idTaken = await User.findOne({ employeeId: normalizedId, _id: { $ne: user._id } });
        if (idTaken) {
          return res.status(400).json({ success: false, message: 'This Employee ID is already registered.' });
        }
        user.employeeId = normalizedId;
      }
    }

    if (department !== undefined) user.department = String(department).trim().slice(0, 50);
    if (designation !== undefined) user.designation = String(designation).trim().slice(0, 50);

    if (bio !== undefined) {
      const bioError = validateDescription(bio, 200, 'Bio');
      if (bioError) return res.status(400).json({ success: false, message: bioError });
      user.bio = bio;
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    if (theme && ['light', 'dark'].includes(theme)) {
      user.theme = theme;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        email: updatedUser.email,
        employeeId: updatedUser.employeeId,
        department: updatedUser.department,
        designation: updatedUser.designation,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
        theme: updatedUser.theme
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword; // Pre-save hook will hash this
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search users for invitations
 * @route   GET /api/users/search
 * @access  Private
 */
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const regex = new RegExp(escapeRegex(q.trim()), 'i');

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ username: regex }, { email: regex }, { fullName: regex }, { employeeId: regex }]
    })
      .select('fullName username email employeeId department designation profilePicture')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Look up ONE exact user by Employee ID or account detail (Gmail / username)
 *          Used by the "Add Team Member" dialog to show a preview card before inviting.
 * @route   GET /api/users/lookup?employeeId=EMP-1&email=x@gmail.com&username=abc&projectId=...
 * @access  Private
 */
const lookupUser = async (req, res, next) => {
  try {
    const { employeeId, email, username, projectId } = req.query;

    const conditions = [];
    if (employeeId && employeeId.trim()) {
      conditions.push({ employeeId: employeeId.trim().toUpperCase() });
    }
    if (email && email.trim()) {
      conditions.push({ email: email.trim().toLowerCase() });
    }
    if (username && username.trim()) {
      conditions.push({ username: username.trim().toLowerCase() });
    }

    if (conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Enter an Employee ID, Gmail address or username.'
      });
    }

    const found = await User.findOne({ $or: conditions }).select(
      'fullName username email employeeId department designation profilePicture'
    );

    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'No user found. Check the Employee ID / Gmail and try again.'
      });
    }

    if (found._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot add yourself.' });
    }

    // Tell the UI if this person is already in the project / already invited
    let status = 'available';
    if (projectId) {
      const project = await Project.findById(projectId).select('members');
      if (project && project.members.some((m) => m.user.toString() === found._id.toString())) {
        status = 'member';
      } else {
        const Invitation = require('../models/Invitation');
        const pending = await Invitation.findOne({
          project: projectId,
          invitedUser: found._id,
          status: 'pending'
        });
        if (pending) status = 'invited';
      }
    }

    return res.status(200).json({ success: true, data: found, status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  searchUsers,
  lookupUser
};
