// ── NotificationContext.js ─────────────────────────────────────
// Polls the backend every 15 seconds for the total unread message count.
// Any component can call useNotifications() to read the badge number.

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({ unreadMessages: 0, refresh: () => {} });

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  async function fetchUnread() {
    if (!user) { setUnreadMessages(0); return; }
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadMessages(res.data.count);
    } catch (_) {}
  }

  useEffect(() => {
    fetchUnread();
    if (!user) return;
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadMessages, refresh: fetchUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
