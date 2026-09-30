const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { fullName, username, email, password, employeeId, department, designation } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Check duplicate Gmail address
    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this Gmail address already exists.'
      });
    }

    // Check duplicate username
    const usernameExists = await User.findOne({ username: normalizedUsername });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken.'
      });
    }

    // Check duplicate Employee ID
    const normalizedEmployeeId = employeeId.trim().toUpperCase();
    const employeeIdExists = await User.findOne({ employeeId: normalizedEmployeeId });
    if (employeeIdExists) {
      return res.status(400).json({
        success: false,
        message: 'This Employee ID is already registered.'
      });
    }

    // Create user (password will be hashed via Mongoose pre-save hook)
    const user = await User.create({
      fullName: fullName.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      employeeId: normalizedEmployeeId,
      department: department ? department.trim() : '',
      designation: designation ? designation.trim() : '',
      password
    });

    if (user) {
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          employeeId: user.employeeId,
          department: user.department,
          designation: user.designation,
          bio: user.bio,
          profilePicture: user.profilePicture,
          theme: user.theme,
          token
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data provided.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          employeeId: user.employeeId,
          department: user.department,
          designation: user.designation,
          bio: user.bio,
          profilePicture: user.profilePicture,
          theme: user.theme,
          token
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid Gmail address or password.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser
};
