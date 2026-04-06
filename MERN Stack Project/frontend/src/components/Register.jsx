import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', username: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await api.post('/auth/register', payload);
      login(res.data.user, res.data.token);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <div className="auth-logo">⚔️</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Knight Market today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" type="text" name="firstName" placeholder="First" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" type="text" name="lastName" placeholder="Last" value={form.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" placeholder="you@knights.ucf.edu" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" name="confirmPassword" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/" className="link-gold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
