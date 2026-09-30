const {
  validateGmail,
  validateName,
  validateUsername,
  validateEmployeeId,
  validatePassword,
  validateProjectName,
  validateTaskTitle,
  validateDescription,
  validateDates
} = require('../utils/validators');

/**
 * Validate Register Request Body
 */
const validateRegister = (req, res, next) => {
  const { fullName, username, email, password, confirmPassword } = req.body;

  const nameError = validateName(fullName, 'Full Name');
  if (nameError) return res.status(400).json({ success: false, message: nameError });

  const usernameError = validateUsername(username);
  if (usernameError) return res.status(400).json({ success: false, message: usernameError });

  const emailError = validateGmail(email);
  if (emailError) return res.status(400).json({ success: false, message: emailError });

  const employeeIdError = validateEmployeeId(req.body.employeeId, true);
  if (employeeIdError) return res.status(400).json({ success: false, message: employeeIdError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ success: false, message: passwordError });

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  next();
};

/**
 * Validate Login Request Body
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const emailError = validateGmail(email);
  if (emailError) return res.status(400).json({ success: false, message: emailError });

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  next();
};

/**
 * Validate Project Inputs
 */
const validateProjectInput = (req, res, next) => {
  const { name, description, startDate, endDate } = req.body;

  const nameError = validateProjectName(name);
  if (nameError) return res.status(400).json({ success: false, message: nameError });

  const descError = validateDescription(description, 500, 'Project Description');
  if (descError) return res.status(400).json({ success: false, message: descError });

  const dateError = validateDates(startDate, endDate);
  if (dateError) return res.status(400).json({ success: false, message: dateError });

  next();
};

/**
 * Validate Task Inputs
 */
const validateTaskInput = (req, res, next) => {
  const { title, description } = req.body;

  const titleError = validateTaskTitle(title);
  if (titleError) return res.status(400).json({ success: false, message: titleError });

  const descError = validateDescription(description, 500, 'Task Description');
  if (descError) return res.status(400).json({ success: false, message: descError });

  next();
};

/**
 * Validate Comment Input
 */
const validateCommentInput = (req, res, next) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
  }
  const descError = validateDescription(text, 500, 'Comment');
  if (descError) return res.status(400).json({ success: false, message: descError });

  next();
};

/**
 * Validate Password Change Input
 */
const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is required.' });
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) return res.status(400).json({ success: false, message: passwordError });

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProjectInput,
  validateTaskInput,
  validateCommentInput,
  validatePasswordChange
};
