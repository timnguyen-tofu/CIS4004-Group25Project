// ── CreateListing.jsx ──────────────────────────────────────────
// Form to create a new listing, then optionally upload up to 5 images.

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function CreateListing() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    category: '', condition: 'Good', location: 'UCF Main Campus'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews]           = useState([]);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data);
      if (res.data.length > 0) {
        setForm(f => ({ ...f, category: res.data[0].name }));
      }
    }).catch(console.error);
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFilePick(e) {
    const incoming = Array.from(e.target.files);
    const combined = [...selectedFiles, ...incoming].slice(0, 5);
    setSelectedFiles(combined);
    const urls = combined.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    e.target.value = '';
  }

  function removePreview(index) {
    const files = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) return setError('Please enter a valid price.');

    setLoading(true);
    try {
      const res = await api.post('/listings', { ...form, price });
      const listingId = res.data._id;

      if (selectedFiles.length > 0) {
        const fd = new FormData();
        selectedFiles.forEach(f => fd.append('images', f));
        await api.post(`/listings/${listingId}/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate(`/listings/${listingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="page-content">
        <Link to="/marketplace" className="back-link">← Back to Marketplace</Link>

        <div className="form-card glass">
          <h1 className="page-title" style={{ marginBottom: 4 }}>New Listing</h1>
          <p className="page-subtitle" style={{ marginBottom: 22 }}>Fill in the details to post your item.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* ── Photos upload area ── */}
            <div className="form-group">
              <label className="form-label">Photos (up to 5)</label>
              <div className="upload-area" onClick={() => fileRef.current?.click()}>
                <span className="upload-icon"></span>
                <p><strong>Click to add photos</strong></p>
                <p>{selectedFiles.length}/5 selected</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFilePick}
                />
              </div>

              {previews.length > 0 && (
                <div className="img-preview-grid">
                  {previews.map((url, i) => (
                    <div key={i} className="img-preview-item">
                      <img src={url} alt={`preview ${i + 1}`} />
                      <button
                        type="button"
                        className="img-preview-delete"
                        onClick={() => removePreview(i)}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" type="text" name="title"
                placeholder="What are you selling?" value={form.title}
                onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" name="description"
                placeholder="Describe your item…" value={form.description}
                onChange={handleChange} rows={4} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input className="form-input" type="number" name="price"
                  placeholder="0.00" min="0" step="0.01"
                  value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input form-select" name="category"
                  value={form.category} onChange={handleChange} required>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Condition *</label>
                <select className="form-input form-select" name="condition"
                  value={form.condition} onChange={handleChange} required>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" type="text" name="location"
                  placeholder="UCF Main Campus" value={form.location}
                  onChange={handleChange} />
              </div>
            </div>

            <div className="form-actions">
              <Link to="/marketplace" className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-gold" disabled={loading}>
                {loading ? 'Posting…' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
