// ── AdminDashboard.js ───────────────────────────────────────────
// Admin-only page.
// Shows stats, manages all users and all listings.

import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const TABS = ['Overview', 'Users', 'Listings'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  // Overview stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Listings (all, including inactive)
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  // ── Fetch on tab switch ──────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'Overview') fetchStats();
    if (activeTab === 'Users')    fetchUsers();
    if (activeTab === 'Listings') fetchListings();
  }, [activeTab]);

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const res = await api.get('/users/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchUsers() {
    setUsersLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }

  async function fetchListings() {
    setListingsLoading(true);
    try {
      // Fetch all listings regardless of status using admin endpoint
      const res = await api.get('/listings');
      setListings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setListingsLoading(false);
    }
  }

  // ── User actions ─────────────────────────────────────────────
  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change this user to ${newRole}?`)) return;
    try {
      const res = await api.put(`/users/${userId}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm('Delete this user and all their data? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  }

  // ── Listing actions ──────────────────────────────────────────
  async function deleteListing(listingId) {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/listings/${listingId}`);
      setListings(prev => prev.filter(l => l._id !== listingId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">🛡️ Admin Dashboard</h1>
            <p className="page-subtitle">Manage users, listings, and events</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs glass">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'Overview' && (
          <div className="admin-overview">
            {statsLoading ? (
              <div className="loading-state"><div className="spinner" /><p>Loading stats…</p></div>
            ) : stats ? (
              <div className="stats-grid">
                <div className="stat-card glass">
                  <span className="stat-icon">👥</span>
                  <span className="stat-value">{stats.totalUsers}</span>
                  <span className="stat-label">Total Students</span>
                </div>
                <div className="stat-card glass">
                  <span className="stat-icon">🛒</span>
                  <span className="stat-value">{stats.totalListings}</span>
                  <span className="stat-label">Active Listings</span>
                </div>
                <div className="stat-card glass">
                  <span className="stat-icon">📅</span>
                  <span className="stat-value">{stats.totalEvents}</span>
                  <span className="stat-label">Published Events</span>
                </div>
                <div className="stat-card glass">
                  <span className="stat-icon">🛡️</span>
                  <span className="stat-value">{stats.totalAdmins}</span>
                  <span className="stat-label">Admins</span>
                </div>
              </div>
            ) : (
              <p>Could not load stats.</p>
            )}

            <div className="admin-info glass">
              <h2 className="section-title">ℹ️ Admin Capabilities</h2>
              <ul className="admin-info-list">
                <li>🔐 Promote or demote users between Student and Admin roles</li>
                <li>🗑️ Delete any user account and their associated data</li>
                <li>📦 Remove any listing from the marketplace</li>
                <li>📅 Create, edit, and delete campus events</li>
                <li>👁️ View all platform activity across users</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'Users' && (
          <div className="admin-table-section">
            <h2 className="section-title">All Users ({users.length})</h2>

            {usersLoading ? (
              <div className="loading-state"><div className="spinner" /><p>Loading users…</p></div>
            ) : users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="admin-table-wrapper glass">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          {u.firstName || u.lastName
                            ? `${u.firstName} ${u.lastName}`.trim()
                            : '—'}
                        </td>
                        <td>@{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-blue'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => toggleRole(u._id, u.role)}
                            >
                              {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                            </button>
                            <button
                              className="btn btn-danger btn-xs"
                              onClick={() => deleteUser(u._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Listings Tab ── */}
        {activeTab === 'Listings' && (
          <div className="admin-table-section">
            <h2 className="section-title">All Listings ({listings.length})</h2>

            {listingsLoading ? (
              <div className="loading-state"><div className="spinner" /><p>Loading listings…</p></div>
            ) : listings.length === 0 ? (
              <p>No listings found.</p>
            ) : (
              <div className="admin-table-wrapper glass">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Condition</th>
                      <th>Status</th>
                      <th>Seller</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(l => (
                      <tr key={l._id}>
                        <td>{l.title}</td>
                        <td>{l.category}</td>
                        <td>${l.price.toFixed(2)}</td>
                        <td>{l.condition}</td>
                        <td>
                          <span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td>{l.seller?.username || '—'}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => deleteListing(l._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
