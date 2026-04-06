import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [search, setSearch] = useState('');

  function handleLogout() {
    logout();
    navigate('/');
  }

  function isActive(path) {
    return location.pathname.startsWith(path) ? 'active' : '';
  }

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) navigate(`/marketplace?search=${encodeURIComponent(search.trim())}`);
  }

  const initial = (user?.firstName || user?.username || '?')[0].toUpperCase();

  return (
    <nav className="navbar">
      <Link to="/marketplace" className="nav-brand">
        <div className="nav-logo">⚔️</div>
        <span className="nav-title">Knight Market</span>
        <span className="nav-badge">UCF</span>
      </Link>

      <form className="nav-search" onSubmit={handleSearch}>
        <span className="search-icon"></span>
        <input
          type="text"
          placeholder="Search listings…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </form>

      <div className="nav-tabs">
        <Link to="/marketplace" className={`nav-tab ${isActive('/marketplace')}`}>Marketplace</Link>
        <Link to="/events"      className={`nav-tab ${isActive('/events')}`}>Events</Link>
        <Link to="/messages"    className={`nav-tab ${isActive('/messages')}`}>Messages</Link>
      </div>

      <div className="nav-right">
        <div className="nav-user">
          <div className="nav-avatar">{initial}</div>
          <span>{user?.firstName || user?.username}</span>
        </div>
        <button className="btn btn-glass btn-sm" onClick={handleLogout}>Log Out</button>
      </div>
    </nav>
  );
}
