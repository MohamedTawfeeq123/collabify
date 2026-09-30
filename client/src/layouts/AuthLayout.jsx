import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FiLayers, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = () => {
  const { theme, toggleTheme } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-page)'
      }}
    >
      <header
        style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--primary)',
            letterSpacing: '-0.5px'
          }}
        >
          <FiLayers style={{ fontSize: '1.6rem' }} />
          <span>Collabify</span>
        </Link>

        <button
          onClick={toggleTheme}
          className="icon-button"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun style={{ color: '#f59e0b' }} /> : <FiMoon />}
        </button>
      </header>

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <Outlet />
        </div>
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}
      >
        &copy; {new Date().getFullYear()} Collabify Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
