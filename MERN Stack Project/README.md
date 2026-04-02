# ⚔️ Knight Market

A full-stack MERN marketplace and campus hub built for UCF students. Students can buy and sell items, RSVP to campus events, and message each other directly.

---

## Features

- **Marketplace** — Post, browse, search, and filter listings by category
- **Listing Detail** — View full listing info and message the seller directly
- **My Listings** — Manage your own active, sold, and removed listings
- **Events** — Browse campus events and RSVP with one click
- **Messages** — Real-time-style chat between buyers and sellers
- **Admin Dashboard** — Manage users, listings, and events (admin role only)
- **JWT Authentication** — Secure login and registration with bcrypt password hashing

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, React Router v6, Axios |
| Backend   | Node.js, Express.js |
| Database  | MongoDB with Mongoose |
| Auth      | JWT (jsonwebtoken) + bcryptjs |
| Styling   | Custom CSS (Liquid Glass, Black & Gold theme) |

---

## Project Structure

```
knight-market/
├── backend/
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Listing.js        # Listing schema
│   │   ├── Event.js          # Event schema
│   │   ├── Message.js        # Message schema (buyer↔seller)
│   │   └── RSVP.js           # RSVP schema (User ↔ Event many-to-many)
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/register, /login
│   │   ├── listings.js       # CRUD /api/listings
│   │   ├── events.js         # CRUD /api/events + RSVP
│   │   ├── messages.js       # GET/POST /api/messages
│   │   └── users.js          # Admin user management /api/users
│   ├── server.js             # Express app entry point
│   ├── package.json
│   └── .env.example          # Environment variable template
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Marketplace.js
        │   ├── ListingDetail.js
        │   ├── CreateListing.js
        │   ├── EditListing.js
        │   ├── MyListings.js
        │   ├── Events.js
        │   ├── Messages.js
        │   └── AdminDashboard.js
        ├── context/
        │   └── AuthContext.js  # Global auth state (user, token, login, logout)
        ├── api.js              # Axios instance with JWT interceptor
        ├── App.js              # Routes and layout
        ├── App.css             # Global styles
        └── index.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/knight-market.git
cd knight-market
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in your MONGO_URI and JWT_SECRET
npm run dev
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm start
```

The React app runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## Environment Variables

Create `backend/.env` using the provided `.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/knight-market
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/listings` | Get all active listings | Public |
| GET | `/api/listings/mine` | Get my listings | 🔒 |
| GET | `/api/listings/:id` | Get one listing | Public |
| POST | `/api/listings` | Create a listing | 🔒 |
| PUT | `/api/listings/:id` | Update a listing | 🔒 Owner/Admin |
| DELETE | `/api/listings/:id` | Delete a listing | 🔒 Owner/Admin |
| GET | `/api/events` | Get all events | Public |
| POST | `/api/events` | Create an event | 🔒 Admin |
| PUT | `/api/events/:id` | Update an event | 🔒 Admin |
| DELETE | `/api/events/:id` | Delete an event | 🔒 Admin |
| POST | `/api/events/:id/rsvp` | RSVP to event | 🔒 |
| DELETE | `/api/events/:id/rsvp` | Cancel RSVP | 🔒 |
| GET | `/api/messages/conversations` | List conversations | 🔒 |
| GET | `/api/messages/:userId` | Get messages with user | 🔒 |
| POST | `/api/messages` | Send a message | 🔒 |
| GET | `/api/users` | List all users | 🔒 Admin |
| GET | `/api/users/stats` | Dashboard stats | 🔒 Admin |
| PUT | `/api/users/:id` | Update user role | 🔒 Admin |
| DELETE | `/api/users/:id` | Delete a user | 🔒 Admin |

---

## Database Models

**User** — `username`, `email`, `password (hashed)`, `firstName`, `lastName`, `role (user|admin)`

**Listing** — `title`, `description`, `price`, `category`, `condition`, `location`, `status`, `seller → User`

**Event** — `title`, `description`, `date`, `time`, `location`, `category`, `status`, `organizer → User`

**Message** — `sender → User`, `receiver → User`, `content`, `listing → Listing (optional)`

**RSVP** — `user → User`, `event → Event` *(compound unique index — prevents duplicate RSVPs)*

---

## License

MIT
