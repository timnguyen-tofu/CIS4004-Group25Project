import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const TABS = ['Overview', 'Users', 'Listings', 'Categories'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  const [stats, setStats]             = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [listings, setListings]               = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const [categories, setCategories]               = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [newCategoryName, setNewCategoryName]     = useState('');
  const [categoryError, setCategoryError]         = useState('');
  const [categoryAdding, setCategoryAdding]       = useState(false);

  useEffect(() => {
    if (activeTab === 'Overview')   fetchStats();
    if (activeTab === 'Users')      fetchUsers();
    if (activeTab === 'Listings')   fetchListings();
    if (activeTab === 'Categories') fetchCategories();
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
      const res = await api.get('/listings');
      setListings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setListingsLoading(false);
    }
  }

  async function fetchCategories() {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  }

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

  async function deleteListing(listingId) {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/listings/${listingId}`);
      setListings(prev => prev.filter(l => l._id !== listingId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    setCategoryError('');
    if (!newCategoryName.trim()) return;
    setCategoryAdding(true);
    try {
      const res = await api.post('/categories', { name: newCategoryName.trim() });
      setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to add category.');
    } finally {
      setCategoryAdding(false);
    }
  }

  async function handleDeleteCategory(id, name) {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage users, listings, events, and categories</p>
          </div>
        </div>

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

        {activeTab === 'Overview' && (
          <div className="admin-overview">
            {statsLoading ? (
              <div className="loading-state"><div className="spinner" /><p>Loading stats…</p></div>
            ) : stats ? (
              <div className="stats-grid">
                <div className="stat-card glass">
                  <span className="stat-icon"></span>
                  <span className="stat-value">{stats.totalUsers}</span>
                  <span className="stat-label">Total Students</span>
                </div>
                <div className="stat-card glass">
                  <span className="stat-icon"></span>
                  <span className="stat-value">{stats.totalListings}</span>
                  <span className="stat-label">Active Listings</span>
                </div>
                <div className="stat-card glass">
                  <span className="stat-icon"></span>
                  <span className="stat-value">{stats.totalEvents}</span>
                  <span className="stat-label">Published Events</span>
                </div>
                <div className="stat-card glass">
                  <span className="stat-icon"></span>
                  <span className="stat-value">{stats.totalAdmins}</span>
                  <span className="stat-label">Admins</span>
                </div>
              </div>
            ) : (
              <p>Could not load stats.</p>
            )}

            <div className="admin-info glass">
              <h2 className="section-title">Admin Capabilities</h2>
              <ul className="admin-info-list">
                <li>Promote or demote users between Student and Admin roles</li>
                <li>Delete any user account and their associated data</li>
                <li>Remove any listing from the marketplace</li>
                <li>Create, edit, and delete campus events</li>
                <li>Add and remove listing categories</li>
                <li>View all platform activity across users</li>
              </ul>
            </div>
          </div>
        )}

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
                      <th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>{u.firstName || u.lastName ? `${u.firstName} ${u.lastName}`.trim() : 'N/A'}</td>
                        <td>@{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-blue'}`}>{u.role}</span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-outline btn-xs" onClick={() => toggleRole(u._id, u.role)}>
                              {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                            </button>
                            <button className="btn btn-danger btn-xs" onClick={() => deleteUser(u._id)}>Delete</button>
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
                      <th>Title</th><th>Category</th><th>Price</th><th>Condition</th><th>Status</th><th>Seller</th><th>Actions</th>
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
                          <span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-red'}`}>{l.status}</span>
                        </td>
                        <td>{l.seller?.username || 'N/A'}</td>
                        <td>
                          <button className="btn btn-danger btn-xs" onClick={() => deleteListing(l._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Categories' && (
          <div className="admin-table-section">
            <h2 className="section-title">Listing Categories ({categories.length})</h2>

            <div className="glass" style={{ padding: '20px', marginBottom: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--txt)' }}>Add New Category</h3>
              {categoryError && <div className="alert alert-error" style={{ marginBottom: 12 }}>{categoryError}</div>}
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: 10 }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Category name…"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-gold" disabled={categoryAdding || !newCategoryName.trim()}>
                  {categoryAdding ? 'Adding…' : 'Add'}
                </button>
              </form>
            </div>

            {categoriesLoading ? (
              <div className="loading-state"><div className="spinner" /><p>Loading categories…</p></div>
            ) : categories.length === 0 ? (
              <p style={{ color: 'var(--txt-muted)' }}>No categories yet. Add one above.</p>
            ) : (
              <div className="admin-table-wrapper glass">
                <table className="admin-table">
                  <thead>
                    <tr><th>Category Name</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDeleteCategory(c._id, c.name)}>Delete</button>
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
