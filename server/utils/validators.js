/**
 * Enterprise Validation Utilities for Collabify Backend
 * Strictly mirrors the frontend rules to ensure complete data integrity.
 */

// Gmail validation: only valid Gmail addresses ending with @gmail.com
const validateGmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Please enter a valid Gmail address ending with @gmail.com';
  }
  const trimmed = email.trim();
  const gmailRegex = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*@gmail\.com$/;
  if (!gmailRegex.test(trimmed)) {
    return 'Please enter a valid Gmail address ending with @gmail.com';
  }
  return null;
};

// Name validation: 2-50 chars, letters and spaces only
const validateName = (name, fieldLabel = 'Name') => {
  if (!name || typeof name !== 'string') {
    return `${fieldLabel} is required.`;
  }
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    return `${fieldLabel} must be between 2 and 50 characters.`;
  }
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(trimmed)) {
    return `${fieldLabel} should contain only letters and spaces.`;
  }
  return null;
};

// Username validation: 3-20 chars, letters, numbers, underscore, no spaces
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return 'Username is required.';
  }
  const trimmed = username.trim();
  if (/\s/.test(trimmed)) {
    return 'Username cannot contain spaces.';
  }
  if (trimmed.length < 3 || trimmed.length > 20) {
    return 'Username must be 3–20 characters.';
  }
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return 'Username can contain only letters, numbers and underscores.';
  }
  return null;
};

// Employee ID validation: 3-20 chars, letters, numbers, hyphen, underscore
const validateEmployeeId = (employeeId, required = true) => {
  if (!employeeId || typeof employeeId !== 'string' || !employeeId.trim()) {
    return required ? 'Employee ID is required.' : null;
  }
  const trimmed = employeeId.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return 'Employee ID must be 3-20 characters.';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return 'Employee ID can contain only letters, numbers, hyphens and underscores.';
  }
  return null;
};

// Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character.';
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character.';
  }
  return null;
};

// Project Name validation: 3-100 characters, cannot be only spaces
const validateProjectName = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return 'Project name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return 'Project name must contain at least 3 characters.';
  }
  if (trimmed.length > 100) {
    return 'Project name cannot exceed 100 characters.';
  }
  return null;
};

// Task Title validation: 3-100 characters, cannot be only spaces
const validateTaskTitle = (title) => {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'Task title is required.';
  }
  const trimmed = title.trim();
  if (trimmed.length < 3) {
    return 'Task title must contain at least 3 characters.';
  }
  if (trimmed.length > 100) {
    return 'Task title cannot exceed 100 characters.';
  }
  return null;
};

// Description validation: length limit (default 500)
const validateDescription = (desc, max = 500, fieldName = 'Description') => {
  if (!desc) return null;
  if (typeof desc === 'string' && desc.length > max) {
    return `Maximum ${max} characters allowed for ${fieldName}.`;
  }
  return null;
};

// Date validation: End date cannot be earlier than start date
const validateDates = (startDate, endDate) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Please enter valid date values.';
    }
    if (end < start) {
      return 'End date cannot be earlier than start date.';
    }
  }
  return null;
};

module.exports = {
  validateGmail,
  validateName,
  validateUsername,
  validateEmployeeId,
  validatePassword,
  validateProjectName,
  validateTaskTitle,
  validateDescription,
  validateDates
};
