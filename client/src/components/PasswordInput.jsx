import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import { checkPasswordCriteria } from '../utils/validators';

/**
 * Reusable PasswordInput Component
 * Supports Show/Hide password toggle and optional real-time password criteria checklist.
 */
const PasswordInput = ({
  label = 'Password',
  name = 'password',
  value = '',
  onChange,
  onBlur,
  error = '',
  placeholder = '••••••••',
  required = false,
  showCriteria = false,
  autoComplete = 'current-password'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const isInvalid = touched && Boolean(error);
  const criteria = checkPasswordCriteria(value);

  return (
    <div className="form-group">
      <div className="form-label-row">
        <label htmlFor={name} className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      </div>

      <div className="input-container">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`form-input ${isInvalid ? 'has-error' : ''}`}
          style={{ paddingRight: '2.5rem' }}
          aria-invalid={isInvalid}
        />
        <button
          type="button"
          className="input-action-btn"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {isInvalid && (
        <div className="field-error-msg" role="alert">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {showCriteria && value.length > 0 && (
        <div className="password-criteria">
          <div className={`criteria-item ${criteria.minLength ? 'valid' : ''}`}>
            {criteria.minLength ? <FiCheck /> : <FiX />} At least 8 characters
          </div>
          <div className={`criteria-item ${criteria.hasUpper ? 'valid' : ''}`}>
            {criteria.hasUpper ? <FiCheck /> : <FiX />} At least one uppercase letter (A-Z)
          </div>
          <div className={`criteria-item ${criteria.hasLower ? 'valid' : ''}`}>
            {criteria.hasLower ? <FiCheck /> : <FiX />} At least one lowercase letter (a-z)
          </div>
          <div className={`criteria-item ${criteria.hasNumber ? 'valid' : ''}`}>
            {criteria.hasNumber ? <FiCheck /> : <FiX />} At least one number (0-9)
          </div>
          <div className={`criteria-item ${criteria.hasSpecial ? 'valid' : ''}`}>
            {criteria.hasSpecial ? <FiCheck /> : <FiX />} At least one special character (@, $, !, %, etc.)
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
