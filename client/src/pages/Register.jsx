import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiAtSign, FiMail, FiArrowRight } from 'react-icons/fi';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import {
  validateGmail,
  validateName,
  validateUsername,
  validateEmployeeId,
  validatePassword,
  validateConfirmPassword
} from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Instant real-time validation
    if (name === 'fullName') {
      setErrors((prev) => ({ ...prev, fullName: validateName(value, 'Full Name') }));
    }
    if (name === 'username') {
      setErrors((prev) => ({ ...prev, username: validateUsername(value) }));
    }
    if (name === 'employeeId') {
      setErrors((prev) => ({ ...prev, employeeId: validateEmployeeId(value) }));
    }
    if (name === 'email') {
      setErrors((prev) => ({ ...prev, email: validateGmail(value) }));
    }
    if (name === 'password') {
      const passErr = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: passErr,
        confirmPassword: formData.confirmPassword
          ? validateConfirmPassword(value, formData.confirmPassword)
          : ''
      }));
    }
    if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(formData.password, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'fullName') setErrors((prev) => ({ ...prev, fullName: validateName(value, 'Full Name') }));
    if (name === 'username') setErrors((prev) => ({ ...prev, username: validateUsername(value) }));
    if (name === 'employeeId') setErrors((prev) => ({ ...prev, employeeId: validateEmployeeId(value) }));
    if (name === 'email') setErrors((prev) => ({ ...prev, email: validateGmail(value) }));
    if (name === 'password') setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(formData.password, value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateName(formData.fullName, 'Full Name');
    const userErr = validateUsername(formData.username);
    const idErr = validateEmployeeId(formData.employeeId);
    const emailErr = validateGmail(formData.email);
    const passErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);

    const validationErrors = {
      fullName: nameErr,
      username: userErr,
      employeeId: idErr,
      email: emailErr,
      password: passErr,
      confirmPassword: confirmErr
    };

    setErrors(validationErrors);

    if (nameErr || userErr || idErr || emailErr || passErr || confirmErr) {
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      fullName: formData.fullName,
      username: formData.username,
      employeeId: formData.employeeId.trim().toUpperCase(),
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  const hasAnyError = Boolean(
    errors.fullName ||
    errors.username ||
    errors.employeeId ||
    errors.email ||
    errors.password ||
    errors.confirmPassword
  );

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Create an account
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Join Collabify to start managing projects with your team
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fullName}
          successMessage={!errors.fullName && formData.fullName ? '✓ Valid name' : ''}
          placeholder="e.g. Mohamed Tawfeeq"
          required
          maxLength={50}
          icon={FiUser}
        />

        <FormInput
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.username}
          successMessage={!errors.username && formData.username ? '✓ Valid username' : ''}
          placeholder="e.g. mohamed123"
          required
          maxLength={20}
          icon={FiAtSign}
        />

        <FormInput
          label="Employee ID"
          name="employeeId"
          value={formData.employeeId}
          onChange={(e) => handleChange({ target: { name: 'employeeId', value: e.target.value.toUpperCase() } })}
          onBlur={handleBlur}
          error={errors.employeeId}
          successMessage={!errors.employeeId && formData.employeeId ? '✓ Valid Employee ID' : ''}
          placeholder="e.g. EMP-1024"
          required
          maxLength={20}
        />

        <FormInput
          label="Gmail Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          successMessage={!errors.email && formData.email ? '✓ Valid Gmail address' : ''}
          placeholder="e.g. mohamed@gmail.com"
          required
          autoComplete="email"
          icon={FiMail}
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          required
          showCriteria={true}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          required
          placeholder="Re-enter password"
          autoComplete="new-password"
        />

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
          disabled={isSubmitting || hasAnyError}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'} <FiArrowRight />
        </button>
      </form>

      <div
        style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}
      >
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
