// ── MyListings.js ───────────────────────────────────────────────
// Shows all listings posted by the currently logged-in user.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyListings();
  }, []);

  async function fetchMyListings() {
    try {
      const res = await api.get('/listings/mine');
      setListings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  }

  function statusBadge(status) {
    const map = { active: 'badge-green', sold: 'badge-orange', removed: 'badge-red' };
    return map[status] || 'badge-default';
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">📦 My Listings</h1>
            <p className="page-subtitle">{listings.length} listing{listings.length !== 1 ? 's' : ''} posted</p>
          </div>
          <Link to="/create-listing" className="btn btn-gold">+ New Listing</Link>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading…</p></div>
        ) : listings.length === 0 ? (
          <div className="empty-state glass">
            <span className="empty-icon">📭</span>
            <p>You haven't posted any listings yet.</p>
            <Link to="/create-listing" className="btn btn-gold">Post Your First Item</Link>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(listing => (
              <div
                key={listing._id}
                className="listing-card glass"
                onClick={() => navigate(`/listings/${listing._id}`)}
              >
                <div className="listing-card-top">
                  <span className="badge badge-category">{listing.category}</span>
                  <span className={`badge ${statusBadge(listing.status)}`}>{listing.status}</span>
                </div>

                <h3 className="listing-title">{listing.title}</h3>
                <p className="listing-description">
                  {listing.description || 'No description.'}
                </p>

                <div className="listing-card-footer">
                  <span className="listing-price">${listing.price.toFixed(2)}</span>
                  <div className="listing-actions" onClick={e => e.stopPropagation()}>
                    <Link
                      to={`/edit-listing/${listing._id}`}
                      className="btn btn-outline btn-xs"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-xs"
                      onClick={(e) => handleDelete(listing._id, e)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
