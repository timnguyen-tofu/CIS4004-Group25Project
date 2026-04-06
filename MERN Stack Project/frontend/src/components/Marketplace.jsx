import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Marketplace() {
  const [listings, setListings]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const navigate                    = useNavigate();
  const [searchParams]              = useSearchParams();

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line
  }, [category]);

  async function fetchListings() {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/listings', { params });
      setListings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchListings();
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Marketplace</h1>
            <p className="page-subtitle">{listings.length} listing{listings.length !== 1 ? 's' : ''} available</p>
          </div>
          <Link to="/create-listing" className="btn btn-gold">+ Sell Item</Link>
        </div>

        {/* search */}
        <div className="filter-bar glass" style={{ marginBottom: 16 }}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              className="form-input search-input"
              type="text"
              placeholder="Search listings…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-gold btn-sm">Search</button>
          </form>
        </div>

        {/* category filter pills */}
        <div className="cat-bar">
          <button className={`cat-pill ${category === 'All' ? 'active' : ''}`} onClick={() => setCategory('All')}>
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              className={`cat-pill ${category === cat.name ? 'active' : ''}`}
              onClick={() => setCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* listings grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading listings…</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state glass">
            <span className="empty-icon"></span>
            <p>No listings found. Try a different search or category.</p>
            <Link to="/create-listing" className="btn btn-gold" style={{ marginTop: 16 }}>Post Something</Link>
          </div>
        ) : (
          <div className="listing-grid">
            {listings.map(listing => (
              <div
                key={listing._id}
                className="listing-card"
                onClick={() => navigate(`/listings/${listing._id}`)}
              >
                <div className="listing-card-img">
                  {listing.images && listing.images.length > 0
                    ? <img src={`/listing-images/${listing.images[0]}`} alt={listing.title} />
                    : <span>{listing.category}</span>
                  }
                </div>
                <div className="listing-info">
                  <div className="l-price">${listing.price.toFixed(2)}</div>
                  <div className="l-title">{listing.title}</div>
                  <div className="l-loc">{listing.location}</div>
                  <span className="l-badge">{listing.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
