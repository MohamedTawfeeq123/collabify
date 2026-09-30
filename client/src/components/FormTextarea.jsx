import React, { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

/**
 * Reusable FormTextarea Component
 * Features live character counters, dynamic error indication, and character capping.
 */
const FormTextarea = ({
  label,
  name,
  value = '',
  onChange,
  onBlur,
  error = '',
  placeholder = '',
  required = false,
  maxLength = 500,
  rows = 3,
  disabled = false
}) => {
  const [touched, setTouched] = useState(false);

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const isInvalid = touched && Boolean(error);
  const currentLength = typeof value === 'string' ? value.length : 0;
  const isNearLimit = currentLength >= maxLength * 0.85;
  const isAtLimit = currentLength >= maxLength;

  return (
    <div className="form-group">
      <div className="form-label-row">
        {label && (
          <label htmlFor={name} className="form-label">
            {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>
        )}
        <span
          className={`char-counter ${isAtLimit ? 'limit' : isNearLimit ? 'warning' : ''}`}
        >
          {currentLength} / {maxLength}
        </span>
      </div>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        className={`form-textarea ${isInvalid ? 'has-error' : ''}`}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? `${name}-error` : undefined}
      />

      {isInvalid && (
        <div id={`${name}-error`} className="field-error-msg" role="alert">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {isAtLimit && !error && (
        <div className="field-error-msg" style={{ color: 'var(--warning)' }}>
          <FiAlertCircle />
          <span>Maximum {maxLength} characters allowed.</span>
        </div>
      )}
    </div>
  );
};

export default FormTextarea;
