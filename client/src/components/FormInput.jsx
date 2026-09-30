import React, { useState } from 'react';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';

/**
 * Reusable FormInput Component
 * Supports real-time validation, character limits, error/success states, and accessible feedback.
 */
const FormInput = ({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  error = '',
  successMessage = '',
  placeholder = '',
  required = false,
  maxLength,
  disabled = false,
  autoComplete = 'off',
  icon: Icon
}) => {
  const [touched, setTouched] = useState(false);

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const isInvalid = touched && Boolean(error);
  const isValid = touched && !error && value && Boolean(successMessage);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="form-group">
      <div className="form-label-row">
        {label && (
          <label htmlFor={name} className="form-label">
            {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>
        )}
        {maxLength && (
          <span
            className={`char-counter ${
              currentLength >= maxLength
                ? 'limit'
                : currentLength >= maxLength * 0.85
                ? 'warning'
                : ''
            }`}
          >
            {currentLength} / {maxLength}
          </span>
        )}
      </div>

      <div className="input-container">
        {Icon && (
          <span style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }}>
            <Icon />
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`form-input ${isInvalid ? 'has-error' : ''} ${isValid ? 'has-success' : ''}`}
          style={{
            paddingLeft: Icon ? '2.5rem' : '1rem'
          }}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${name}-error` : undefined}
        />
      </div>

      {isInvalid && (
        <div id={`${name}-error`} className="field-error-msg" role="alert">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {isValid && (
        <div className="field-success-msg">
          <FiCheck />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
