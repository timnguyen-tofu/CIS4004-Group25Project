// ── Sidebar.jsx ────────────────────────────────────────────────
// Frosted-glass left navigation panel matching the mockup.
// Included by every protected page layout.

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location         = useLocation();
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

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
        Marketplace
      </Link>

      <Link to="/events" className={`sb-item ${isActive('/events')}`}>
        Events
      </Link>

      <Link to="/messages" className={`sb-item ${isActive('/messages')}`}>
        Messages
      </Link>

      <div className="sb-divider" />
      <div className="sb-section-title">My Account</div>

      <Link to="/my-listings" className={`sb-item ${isActive('/my-listings')}`}>
        My Listings
      </Link>

      <Link to="/create-listing" className={`sb-item ${isActive('/create-listing')}`}>
        Sell Item
      </Link>

      {user?.role === 'admin' && (
        <>
          <div className="sb-divider" />
          <div className="sb-section-title">Admin</div>
          <Link to="/admin" className={`sb-item ${isActive('/admin')}`}>
            Dashboard
          </Link>
        </>
      )}

      <div className="sb-divider" />

      <button className="sb-item sb-logout" onClick={handleLogout}>
        Log Out
      </button>
    </aside>
  );
}
