// ── EditListing.jsx ────────────────────────────────────────────
// Edit listing details + manage photos (add/delete, max 5 total).

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const STATUSES   = ['active', 'sold', 'removed'];

export default function EditListing() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [categories, setCategories]     = useState([]);
  const [form, setForm]                 = useState(null);
  const [existingImgs, setExisting]     = useState([]);
  const [newFiles, setNewFiles]         = useState([]);
  const [newPreviews, setNewPreviews]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    fetchListing();
    // eslint-disable-next-line
  }, [id]);

  async function fetchListing() {
    try {
      const res = await api.get(`/listings/${id}`);
      const l   = res.data;
      if (l.seller?._id !== user.id && user.role !== 'admin') {
        navigate('/marketplace'); return;
      }
      setForm({
        title: l.title, description: l.description || '',
        price: l.price, category: l.category,
        condition: l.condition, location: l.location || '',
        status: l.status
      });
      setExisting(l.images || []);
    } catch (err) {
      setError('Failed to load listing.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleNewFiles(e) {
    const incoming = Array.from(e.target.files);
    const totalAfter = existingImgs.length + newFiles.length + incoming.length;
    const allowed = Math.min(incoming.length, 5 - existingImgs.length - newFiles.length);
    if (allowed <= 0) { setError('Maximum of 5 photos reached.'); return; }
    if (totalAfter > 5) setError(`Only adding ${allowed} of ${incoming.length} images (5 max).`);
    const combined = [...newFiles, ...incoming.slice(0, allowed)];
    setNewFiles(combined);
    setNewPreviews(combined.map(f => URL.createObjectURL(f)));
    e.target.value = '';
  }

  function removeNewFile(index) {
    const files = newFiles.filter((_, i) => i !== index);
    setNewFiles(files);
    setNewPreviews(files.map(f => URL.createObjectURL(f)));
  }

  async function deleteExistingImg(filename) {
    if (!window.confirm('Delete this photo?')) return;
    try {
      const res = await api.delete(`/listings/${id}/images/${filename}`);
      setExisting(res.data.images);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) return setError('Please enter a valid price.');

    setSaving(true);
    try {
      await api.put(`/listings/${id}`, { ...form, price });

      if (newFiles.length > 0) {
        const fd = new FormData();
        newFiles.forEach(f => fd.append('images', f));
        await api.post(`/listings/${id}/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate(`/listings/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="app-layout"><Navbar /><Sidebar />
      <main className="page-content"><div className="loading-state"><div className="spinner" /><p>Loading…</p></div></main>
    </div>
  );

  if (!form) return (
    <div className="app-layout"><Navbar /><Sidebar />
      <main className="page-content">
        <div className="empty-state glass"><p>{error || 'Listing not found.'}</p>
          <Link to="/marketplace" className="btn btn-gold">Back</Link>
        </div>
      </main>
    </div>
  );

  const totalImgs  = existingImgs.length + newFiles.length;
  const canAddMore = totalImgs < 5;

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="page-content">
        <Link to={`/listings/${id}`} className="back-link">← Back to Listing</Link>

        <div className="form-card glass">
          <h1 className="page-title" style={{ marginBottom: 4 }}>Edit Listing</h1>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* ── Photo Management ── */}
            <div className="form-group">
              <label className="form-label">Photos ({totalImgs}/5)</label>

              {existingImgs.length > 0 && (
                <div className="img-preview-grid" style={{ marginBottom: 10 }}>
                  {existingImgs.map(filename => (
                    <div key={filename} className="img-preview-item">
                      <img src={`/listing-images/${filename}`} alt={filename} />
                      <button
                        type="button"
                        className="img-preview-delete"
                        onClick={() => deleteExistingImg(filename)}
                      >✕</button>
                    </div>
                  ))}
                  {newPreviews.map((url, i) => (
                    <div key={`new-${i}`} className="img-preview-item">
                      <img src={url} alt={`new ${i + 1}`} />
                      <button
                        type="button"
                        className="img-preview-delete"
                        onClick={() => removeNewFile(i)}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              {existingImgs.length === 0 && newPreviews.length === 0 && (
                <div className="upload-area" onClick={() => fileRef.current?.click()}>
                  <span className="upload-icon"></span>
                  <p><strong>Click to add photos</strong></p>
                  <p>0/5 added</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple
                    style={{ display: 'none' }} onChange={handleNewFiles} />
                </div>
              )}

              {canAddMore && (existingImgs.length > 0 || newPreviews.length > 0) && (
                <button
                  type="button"
                  className="btn btn-glass btn-sm"
                  style={{ marginTop: 8 }}
                  onClick={() => fileRef.current?.click()}
                >
                  + Add More Photos ({totalImgs}/5)
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple
                style={{ display: 'none' }} onChange={handleNewFiles} />
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" type="text" name="title"
                value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" name="description"
                value={form.description} onChange={handleChange} rows={4} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input className="form-input" type="number" name="price"
                  min="0" step="0.01" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-input form-select" name="category"
                  value={form.category} onChange={handleChange}>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Condition *</label>
                <select className="form-input form-select" name="condition"
                  value={form.condition} onChange={handleChange}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input form-select" name="status"
                  value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" type="text" name="location"
                value={form.location} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <Link to={`/listings/${id}`} className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-gold" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
