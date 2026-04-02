// ── Login.jsx ───────────────────────────────────────────────────
// Split-layout login page matching the Knight Market mockup design.
// Left: branding + stats  |  Right: glass login card

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-container">

        {/* ── Left: Branding ── */}
        <div className="login-brand">
          <span className="lb-icon">⚔️</span>
          <div className="lb-name">Knight Market</div>
          <p className="lb-desc">
            UCF's official student marketplace — buy, sell, and trade
            with fellow Knights on campus.
          </p>
          <div className="lb-stats">
            <div>
              <div className="lb-stat-n">500+</div>
              <div className="lb-stat-l">Students</div>
            </div>
            <div>
              <div className="lb-stat-n">1k+</div>
              <div className="lb-stat-l">Listings</div>
            </div>
            <div>
              <div className="lb-stat-n">Free</div>
              <div className="lb-stat-l">Forever</div>
            </div>
          </div>
        </div>

        {/* ── Right: Login Card ── */}
        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="sub">Sign in to your Knight Market account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-full"
              style={{ marginTop: '6px' }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="divider-or">or</div>

          <div className="auth-link">
            Don't have an account?{' '}
            <Link to="/register">Register here</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
