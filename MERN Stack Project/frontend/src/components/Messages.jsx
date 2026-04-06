import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Messages() {
  const { userId: paramUserId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser]   = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newMessage, setNewMessage]       = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [sending, setSending]             = useState(false);

  // listing context passed via nav state from ListingDetail
  const listingContext = location.state?.listing || null;
  const [activeListing, setActiveListing] = useState(listingContext);

  const messagesEndRef = useRef(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // if navigated with a userId, open that conversation
  useEffect(() => {
    if (!paramUserId || loadingConvos) return;
    const existing = conversations.find(c => c.user._id.toString() === paramUserId);
    if (existing) {
      selectConversation(existing.user, existing.listing);
    } else {
      (async () => {
        try {
          setSelectedUser({ _id: paramUserId, username: 'User' });
          if (listingContext) setActiveListing(listingContext);
          await fetchMessages(paramUserId);
        } catch (_) {}
      })();
    }
    // eslint-disable-next-line
  }, [paramUserId, loadingConvos]);

  async function fetchMessages(userId) {
    setLoadingMsgs(true);
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  }

  async function selectConversation(convUser, listing = null) {
    setSelectedUser(convUser);
    setActiveListing(listing || null);
    await fetchMessages(convUser._id);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      const res = await api.post('/messages', {
        receiver: selectedUser._id,
        content:  newMessage.trim(),
        listing:  activeListing?.id || null
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 50);
      fetchConversations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getDisplayName(u) {
    if (!u) return 'Unknown';
    return u.firstName ? `${u.firstName} ${u.lastName}` : u.username;
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="messages-layout">
        {/* conversation list */}
        <aside className="convo-panel glass">
          <h2 className="convo-panel-title">Messages</h2>

          {loadingConvos ? (
            <div className="loading-state-sm"><div className="spinner spinner-sm" /></div>
          ) : conversations.length === 0 ? (
            <div className="convo-empty">
              <p>No conversations yet.</p>
              <p className="txt-muted">Message a seller from any listing.</p>
            </div>
          ) : (
            <ul className="convo-list">
              {conversations.map(convo => (
                <li
                  key={convo.user._id}
                  className={`convo-item ${selectedUser?._id?.toString() === convo.user._id?.toString() ? 'convo-active' : ''}`}
                  onClick={() => selectConversation(convo.user, convo.listing)}
                >
                  <div className="convo-avatar">{getDisplayName(convo.user).charAt(0).toUpperCase()}</div>
                  <div className="convo-info">
                    <span className="convo-name">{getDisplayName(convo.user)}</span>
                    {convo.listing && <span className="convo-listing-tag">re: {convo.listing.title}</span>}
                    <span className="convo-last">
                      {convo.lastMessage?.content?.slice(0, 40)}
                      {(convo.lastMessage?.content?.length || 0) > 40 ? '…' : ''}
                    </span>
                  </div>
                  <span className="convo-date">{formatDate(convo.lastMessage?.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* chat panel */}
        <section className="chat-panel">
          {!selectedUser ? (
            <div className="chat-empty">
              <p>Select a conversation or message a seller from a listing.</p>
            </div>
          ) : (
            <>
              <div className="chat-header glass">
                <div className="chat-header-avatar">{getDisplayName(selectedUser).charAt(0).toUpperCase()}</div>
                <div>
                  <div className="chat-header-name">{getDisplayName(selectedUser)}</div>
                  {activeListing && <div className="chat-header-listing">re: {activeListing.title}</div>}
                </div>
              </div>

              <div className="chat-messages">
                {loadingMsgs ? (
                  <div className="loading-state"><div className="spinner" /></div>
                ) : messages.length === 0 ? (
                  <div className="chat-no-messages">
                    <p>No messages yet. Say hello!</p>
                    {activeListing && <p className="txt-muted">Asking about: <strong>{activeListing.title}</strong></p>}
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender?._id === user.id || msg.sender === user.id;
                    const prevMsg = messages[idx - 1];
                    const showDate = !prevMsg ||
                      new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                    return (
                      <React.Fragment key={msg._id}>
                        {showDate && <div className="chat-date-divider">{formatDate(msg.createdAt)}</div>}
                        <div className={`chat-bubble-row ${isMe ? 'mine' : 'theirs'}`}>
                          <div className={`chat-bubble ${isMe ? 'bubble-mine' : 'bubble-theirs'}`}>
                            {msg.listing && <div className="bubble-listing-tag">{msg.listing.title}</div>}
                            <p className="bubble-text">{msg.content}</p>
                            <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-send-form glass" onSubmit={handleSend}>
                {activeListing && (
                  <div className="send-listing-context">
                    {activeListing.title}
                    <button type="button" className="clear-listing" onClick={() => setActiveListing(null)}>✕</button>
                  </div>
                )}
                <div className="send-row">
                  <input
                    className="form-input send-input"
                    type="text"
                    placeholder="Type a message…"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" className="btn btn-gold" disabled={sending || !newMessage.trim()}>
                    {sending ? '…' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
