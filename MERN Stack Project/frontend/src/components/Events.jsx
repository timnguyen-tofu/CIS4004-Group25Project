import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const CATEGORIES = ['All', 'Academic', 'Social', 'Sports', 'Arts', 'Career', 'Other'];

const EMPTY_EVENT = {
  title: '', description: '', date: '', time: '',
  location: 'UCF Main Campus', category: 'Other', status: 'published'
};

export default function Events() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  const [events, setEvents]         = useState([]);
  const [rsvpedIds, setRsvpedIds]   = useState(new Set());
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [category, setCategory]     = useState('All');
  const [loading, setLoading]       = useState(true);

  // admin event modal
  const [showModal, setShowModal]       = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [modalForm, setModalForm]       = useState(EMPTY_EVENT);
  const [modalError, setModalError]     = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // attendees modal
  const [attendeesEvent, setAttendeesEvent]     = useState(null);
  const [attendees, setAttendees]               = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeesError, setAttendeesError]     = useState('');

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [category]);

  async function fetchAll() {
    setLoading(true);
    try {
      const params = category !== 'All' ? { category } : {};
      const [eventsRes, rsvpsRes] = await Promise.all([
        api.get('/events', { params }),
        api.get('/events/user/rsvps')
      ]);
      setEvents(eventsRes.data);
      setRsvpedIds(new Set(rsvpsRes.data.map(e => e._id)));

      // fetch RSVP count for each event
      const counts = {};
      await Promise.all(eventsRes.data.map(async ev => {
        const r = await api.get(`/events/${ev._id}/rsvpcount`);
        counts[ev._id] = r.data.count;
      }));
      setRsvpCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRsvp(eventId) {
    try {
      if (rsvpedIds.has(eventId)) {
        await api.delete(`/events/${eventId}/rsvp`);
        setRsvpedIds(prev => { const s = new Set(prev); s.delete(eventId); return s; });
        setRsvpCounts(prev => ({ ...prev, [eventId]: (prev[eventId] || 1) - 1 }));
      } else {
        await api.post(`/events/${eventId}/rsvp`);
        setRsvpedIds(prev => new Set(prev).add(eventId));
        setRsvpCounts(prev => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'RSVP failed.');
    }
  }

  function openCreate() {
    setEditingEvent(null);
    setModalForm(EMPTY_EVENT);
    setModalError('');
    setShowModal(true);
  }

  function openEdit(ev) {
    setEditingEvent(ev);
    setModalForm({
      title: ev.title, description: ev.description || '',
      date: ev.date?.slice(0, 10) || '', time: ev.time || '',
      location: ev.location || 'UCF Main Campus',
      category: ev.category || 'Other', status: ev.status || 'published'
    });
    setModalError('');
    setShowModal(true);
  }

  function handleModalChange(e) {
    setModalForm({ ...modalForm, [e.target.name]: e.target.value });
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, modalForm);
      } else {
        await api.post('/events', modalForm);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setModalLoading(false);
    }
  }

  async function openAttendees(ev) {
    setAttendeesEvent(ev);
    setAttendees([]);
    setAttendeesError('');
    setAttendeesLoading(true);
    try {
      const res = await api.get(`/events/${ev._id}/rsvps`);
      setAttendees(res.data);
    } catch (err) {
      setAttendeesError(err.response?.data?.message || 'Failed to load attendees.');
    } finally {
      setAttendeesLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event? All RSVPs will also be removed.')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Campus Events</h1>
            <p className="page-subtitle">{events.length} upcoming event{events.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && <button className="btn btn-gold" onClick={openCreate}>+ Create Event</button>}
        </div>

        <div className="filter-bar glass">
          <div className="category-pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`pill ${category === cat ? 'pill-active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading events…</p></div>
        ) : events.length === 0 ? (
          <div className="empty-state glass">
            <span className="empty-icon"></span>
            <p>No events found in this category.</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map(ev => (
              <div key={ev._id} className="event-card glass">
                <div className="event-date-col">
                  <div className="event-date-box">
                    <span className="event-month">{new Date(ev.date).toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="event-day">{new Date(ev.date).getDate()}</span>
                  </div>
                </div>

                <div className="event-info">
                  <div className="event-badges">
                    <span className="badge badge-category">{ev.category}</span>
                    {rsvpedIds.has(ev._id) && <span className="badge badge-green">✓ RSVP'd</span>}
                  </div>
                  <h3 className="event-title">{ev.title}</h3>
                  {ev.description && <p className="event-description">{ev.description}</p>}
                  <div className="event-meta">
                    {ev.time && <span>{ev.time}</span>}
                    <span>{ev.location}</span>
                    <span>{rsvpCounts[ev._id] || 0} RSVP{rsvpCounts[ev._id] !== 1 ? 's' : ''}</span>
                    <span className="event-full-date">{formatDate(ev.date)}</span>
                  </div>
                </div>

                <div className="event-actions-col">
                  <button
                    className={`btn btn-sm ${rsvpedIds.has(ev._id) ? 'btn-outline' : 'btn-gold'}`}
                    onClick={() => handleRsvp(ev._id)}
                  >
                    {rsvpedIds.has(ev._id) ? 'Cancel RSVP' : 'RSVP'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => openAttendees(ev)}>Attendees</button>
                  {isAdmin && (
                    <div className="admin-event-btns">
                      <button className="btn btn-outline btn-xs" onClick={() => openEdit(ev)}>Edit</button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(ev._id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* attendees modal */}
      {attendeesEvent && (
        <div className="modal-overlay" onClick={() => setAttendeesEvent(null)}>
          <div className="modal-card glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Attendees — {attendeesEvent.title}</h2>
              <button className="modal-close" onClick={() => setAttendeesEvent(null)}>✕</button>
            </div>
            {attendeesLoading ? (
              <div className="loading-state-sm"><div className="spinner spinner-sm" /></div>
            ) : attendeesError ? (
              <p style={{ padding: '16px', color: 'var(--danger, #e74c3c)' }}>{attendeesError}</p>
            ) : attendees.length === 0 ? (
              <p style={{ padding: '16px', color: 'var(--txt-muted)' }}>No one has RSVP'd yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: '8px 0', margin: 0, maxHeight: '360px', overflowY: 'auto' }}>
                {attendees.map((u, i) => (
                  <li key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),#e6a010)', color: '#0a0a0f', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {(u.firstName || u.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {u.firstName ? `${u.firstName} ${u.lastName}` : u.username}
                      </div>
                      {u.firstName && <div style={{ fontSize: 12, color: 'var(--txt-muted)' }}>@{u.username}</div>}
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--txt-dim)' }}>#{i + 1}</span>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 13, color: 'var(--txt-muted)' }}>
              {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* admin create/edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {modalError && <div className="alert alert-error">{modalError}</div>}

            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" type="text" name="title" value={modalForm.title} onChange={handleModalChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" name="description" value={modalForm.description} onChange={handleModalChange} rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-input" type="date" name="date" value={modalForm.date} onChange={handleModalChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input className="form-input" type="text" name="time" placeholder="e.g. 10:00 AM – 2:00 PM" value={modalForm.time} onChange={handleModalChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input form-select" name="category" value={modalForm.category} onChange={handleModalChange}>
                    {['Academic','Social','Sports','Arts','Career','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input form-select" name="status" value={modalForm.status} onChange={handleModalChange}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" type="text" name="location" value={modalForm.location} onChange={handleModalChange} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={modalLoading}>
                  {modalLoading ? 'Saving…' : (editingEvent ? 'Save Changes' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
