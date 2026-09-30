/**
 * Collabify Enterprise Client-Side Validation Utility
 * Enforces unified validation rules across all forms and modals.
 */

// 1. Gmail Validation
export const validateGmail = (email) => {
  if (!email || !email.trim()) {
    return 'Please enter a valid Gmail address ending with @gmail.com';
  }
  const trimmed = email.trim();
  const gmailRegex = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*@gmail\.com$/;
  if (!gmailRegex.test(trimmed)) {
    return 'Please enter a valid Gmail address ending with @gmail.com';
  }
  return '';
};

// 2. Name Validation
export const validateName = (name, fieldLabel = 'Name') => {
  if (!name || !name.trim()) {
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
  return '';
};

// 3. Username Validation
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
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
  return '';
};

// 4. Password Criteria Checker (for live visual feedback)
export const checkPasswordCriteria = (password = '') => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isValid = minLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid
  };
};

// 4b. Password Validation Error Message
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  const { isValid } = checkPasswordCriteria(password);
  if (!isValid) {
    return 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character.';
  }
  return '';
};

// 5. Confirm Password Validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return '';
};

// 6. Project Name Validation
export const validateProjectName = (name) => {
  if (!name || !name.trim()) {
    return 'Project name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return 'Project name must contain at least 3 characters.';
  }
  if (trimmed.length > 100) {
    return 'Project name cannot exceed 100 characters.';
  }
  return '';
};

// 7. Task Title Validation
export const validateTaskTitle = (title) => {
  if (!title || !title.trim()) {
    return 'Task title is required.';
  }
  const trimmed = title.trim();
  if (trimmed.length < 3) {
    return 'Task title must contain at least 3 characters.';
  }
  if (trimmed.length > 100) {
    return 'Task title cannot exceed 100 characters.';
  }
  return '';
};

// 8. Description Validation
export const validateDescription = (desc = '', max = 500, fieldName = 'Description') => {
  if (desc && desc.length > max) {
    return `Maximum ${max} characters allowed.`;
  }
  return '';
};

// 9. Required Field Validation
export const validateRequired = (val, fieldName = 'This field') => {
  if (!val || (typeof val === 'string' && !val.trim())) {
    return `${fieldName} is required.`;
  }
  return '';
};

// 11. Date Validation
export const validateDates = (startDate, endDate) => {
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
  return '';
};

// Employee ID Validation: 3-20 chars, letters / numbers / hyphen / underscore
export const validateEmployeeId = (employeeId, required = true) => {
  if (!employeeId || !employeeId.trim()) {
    return required ? 'Employee ID is required.' : '';
  }
  const trimmed = employeeId.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return 'Employee ID must be 3-20 characters.';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return 'Use only letters, numbers, hyphens and underscores.';
  }
  return '';
};
