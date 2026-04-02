// ── Sidebar.jsx ────────────────────────────────────────────────
// Frosted-glass left navigation panel matching the mockup.
// Included by every protected page layout.

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Sidebar() {
  const location         = useLocation();
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const { unreadMessages } = useNotifications();

  function isActive(path) {
    return location.pathname.startsWith(path) ? 'active' : '';
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <div className="sb-section-title">Browse</div>

      <Link to="/marketplace" className={`sb-item ${isActive('/marketplace') && !location.pathname.startsWith('/my-listings') && !location.pathname.startsWith('/create') && !location.pathname.startsWith('/edit') ? 'active' : ''}`}>
        <div className="sb-icon">🛒</div>
        Marketplace
      </Link>

      <Link to="/events" className={`sb-item ${isActive('/events')}`}>
        <div className="sb-icon">📅</div>
        Events
      </Link>

      <Link to="/messages" className={`sb-item ${isActive('/messages')}`} style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sb-icon">💬</div>
          Messages
        </div>
        {unreadMessages > 0 && (
          <span className="sb-unread-badge">{unreadMessages > 99 ? '99+' : unreadMessages}</span>
        )}
      </Link>

      <div className="sb-divider" />
      <div className="sb-section-title">My Account</div>

      <Link to="/my-listings" className={`sb-item ${isActive('/my-listings')}`}>
        <div className="sb-icon">📦</div>
        My Listings
      </Link>

      <Link to="/create-listing" className={`sb-item ${isActive('/create-listing')}`}>
        <div className="sb-icon">➕</div>
        Sell Item
      </Link>

      {user?.role === 'admin' && (
        <>
          <div className="sb-divider" />
          <div className="sb-section-title">Admin</div>
          <Link to="/admin" className={`sb-item ${isActive('/admin')}`}>
            <div className="sb-icon">🛡️</div>
            Dashboard
          </Link>
        </>
      )}

      <div className="sb-divider" />

      <button className="sb-item sb-logout" onClick={handleLogout}>
        <div className="sb-icon">🚪</div>
        Log Out
      </button>
    </aside>
  );
}
