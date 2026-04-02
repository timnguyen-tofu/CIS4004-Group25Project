// ── ListingDetail.jsx ──────────────────────────────────────────
// Full detail view — image gallery with thumbnails, info card, message seller.

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const CATEGORY_ICONS = {
  Textbooks: '📚', Electronics: '💻', Furniture: '🛋️', Clothing: '👕',
  Gaming: '🎮', Rides: '🚗', Sports: '⚽', Music: '🎵',
  'Dorm Essentials': '🏠', Other: '📦'
};

export default function ListingDetail() {
  const { id }        = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();

  const [listing, setListing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line
  }, [id]);

  async function fetchListing() {
    try {
      const res = await api.get(`/listings/${id}`);
      setListing(res.data);
      setActiveImg(0);
    } catch (err) {
      setError('Listing not found or has been removed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete listing.');
      setDeleting(false);
    }
  }

  const isOwner = user && listing && (listing.seller?._id === user.id || user.role === 'admin');

  if (loading) return (
    <div className="app-layout"><Navbar /><Sidebar />
      <main className="page-content"><div className="loading-state"><div className="spinner" /><p>Loading…</p></div></main>
    </div>
  );

  if (error || !listing) return (
    <div className="app-layout"><Navbar /><Sidebar />
      <main className="page-content">
        <div className="empty-state glass">
          <span className="empty-icon">❌</span>
          <p>{error || 'Listing not found.'}</p>
          <Link to="/marketplace" className="btn btn-gold" style={{ marginTop: 16 }}>Back to Marketplace</Link>
        </div>
      </main>
    </div>
  );

  const sellerName = listing.seller?.firstName
    ? `${listing.seller.firstName} ${listing.seller.lastName}`
    : listing.seller?.username || 'Unknown';

  const hasImages = listing.images && listing.images.length > 0;
  const icon      = CATEGORY_ICONS[listing.category] || '📦';

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="page-content">
        <Link to="/marketplace" className="back-link">← Back to Marketplace</Link>

        <div className="detail-grid">
          {/* ── Left: Images ── */}
          <div>
            <div className="detail-main-img">
              {hasImages
                ? <img src={`/listing-images/${listing.images[activeImg]}`} alt={listing.title} />
                : <span>{icon}</span>
              }
            </div>

            {hasImages && listing.images.length > 1 && (
              <div className="thumb-row">
                {listing.images.map((img, i) => (
                  <div
                    key={img}
                    className={`thumb ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={`/listing-images/${img}`} alt={`thumb ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ── */}
          <div className="detail-side">
            <div className="detail-card glass">
              <div className="d-price">${listing.price.toFixed(2)}</div>
              <div className="d-title">{listing.title}</div>

              <div className="d-tags">
                <span className="d-tag">{listing.category}</span>
                <span className="d-tag">{listing.condition}</span>
                <span className={`d-tag ${listing.status === 'active' ? '' : 'badge-removed'}`}>
                  {listing.status}
                </span>
              </div>

              <table className="mini-table">
                <tbody>
                  <tr><td>Location</td><td>{listing.location}</td></tr>
                  <tr><td>Posted</td><td>{new Date(listing.createdAt).toLocaleDateString()}</td></tr>
                </tbody>
              </table>

              <div className="seller-row">
                <div className="nav-avatar-lg">{sellerName[0].toUpperCase()}</div>
                <div>
                  <div className="seller-name">{sellerName}</div>
                  <div className="seller-sub">Seller</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="detail-card glass">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Description</h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--txt)' }}>
                {listing.description || 'No description provided.'}
              </p>
            </div>

            {/* Actions */}
            {isOwner ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/edit-listing/${listing._id}`} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                  ✏️ Edit Listing
                </Link>
                <button className="btn btn-danger" onClick={handleDelete} disabled={deleting} style={{ flex: 1 }}>
                  {deleting ? 'Deleting…' : '🗑️ Delete'}
                </button>
              </div>
            ) : listing.seller && (
              <Link
                to={`/messages/${listing.seller._id}`}
                state={{ listing: { id: listing._id, title: listing.title } }}
                className="btn btn-gold btn-lg btn-full"
              >
                💬 Message Seller
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
