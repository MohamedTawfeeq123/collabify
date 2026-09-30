import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import { validateGmail } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      const emailErr = validateGmail(value);
      setErrors((prev) => ({ ...prev, email: emailErr }));
    }
    if (name === 'password') {
      setErrors((prev) => ({
        ...prev,
        password: !value ? 'Password is required.' : ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setErrors((prev) => ({ ...prev, email: validateGmail(value) }));
    }
    if (name === 'password') {
      setErrors((prev) => ({
        ...prev,
        password: !value ? 'Password is required.' : ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateGmail(formData.email);
    const passErr = !formData.password ? 'Password is required.' : '';

    setErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) {
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  // Demo Login Quick-Fill Helper for rapid testing
  const fillDemoCredentials = () => {
    setFormData({
      email: 'mohamed@gmail.com',
      password: 'Password@123'
    });
    setErrors({ email: '', password: '' });
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Enter your Gmail address and password to sign in
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
          disabled={isSubmitting || Boolean(errors.email || errors.password)}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'} <FiArrowRight />
        </button>

        <button
          type="button"
          onClick={fillDemoCredentials}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          ⚡ Fill Demo Credentials
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
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
          Create one now
        </Link>
      </div>
    </div>
  );
};

export default Login;
