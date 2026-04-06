import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login          from './components/Login.jsx';
import Register       from './components/Register.jsx';
import Marketplace    from './components/Marketplace.jsx';
import ListingDetail  from './components/ListingDetail.jsx';
import CreateListing  from './components/CreateListing.jsx';
import EditListing    from './components/EditListing.jsx';
import MyListings     from './components/MyListings.jsx';
import Events         from './components/Events.jsx';
import Messages       from './components/Messages.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

import './App.css';

// redirect to login if not logged in
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

// redirect to login or marketplace if not admin
function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/marketplace" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/marketplace"      element={<PrivateRoute><Marketplace /></PrivateRoute>} />
          <Route path="/listings/:id"     element={<PrivateRoute><ListingDetail /></PrivateRoute>} />
          <Route path="/create-listing"   element={<PrivateRoute><CreateListing /></PrivateRoute>} />
          <Route path="/edit-listing/:id" element={<PrivateRoute><EditListing /></PrivateRoute>} />
          <Route path="/my-listings"      element={<PrivateRoute><MyListings /></PrivateRoute>} />
          <Route path="/events"           element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/messages"         element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
