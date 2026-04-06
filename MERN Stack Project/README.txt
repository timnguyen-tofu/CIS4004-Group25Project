============================================================
 Knight Market — UCF Student Marketplace
 CIS 4004 Term Project | Group 25 | Spring 2026
============================================================

------------------------------------------------------------
 HOW TO START THE APPLICATION
------------------------------------------------------------

Prerequisites:
  - Node.js (v18 or higher)
  - npm

The application has two servers: a backend (Express/Node) and
a frontend (React). Both must be running at the same time.

-- Step 1: Configure environment variables --

  Navigate to the backend directory and create a .env file:

    cd "MERN Stack Project/backend"
    cp .env.example .env

  Open .env and fill in:
    MONGO_URI  — your MongoDB connection string (see below)
    JWT_SECRET — any long random string
    PORT       — 8000 (default)

  MongoDB options:
    Local:  MONGO_URI=mongodb://localhost:27017/knight-market
    Atlas:  MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/knight-market

-- Step 2: Start the backend server --

    cd "MERN Stack Project/backend"
    npm install
    npm run dev

  The backend runs on: http://localhost:8000

-- Step 3: Start the frontend (React) server --

  Open a second terminal:

    cd "MERN Stack Project/frontend"
    npm install
    npm start

  The React app runs on: http://localhost:3000

-- Step 4: Open the application --

  Navigate to: http://localhost:3000

  The first screen is the Login page.
  Click "Create one" to register a new account.

------------------------------------------------------------
 MONGODB COLLECTIONS
------------------------------------------------------------

The application uses the following 5 collections:

  1. users     — student and admin accounts
  2. listings  — marketplace items posted by students
  3. messages  — direct messages between users
  4. events    — campus events created by admins
  5. rsvps     — many-to-many join between users and events

No manual collection setup is needed — Mongoose creates
the collections automatically on first use.

------------------------------------------------------------
 DEFAULT ADMIN ACCOUNT
------------------------------------------------------------

To create an admin account, register a normal account first,
then manually update the user's role to "admin" in MongoDB:

  db.users.updateOne(
    { username: "yourusername" },
    { $set: { role: "admin" } }
  )

Alternatively, use the seed script:

    cd "MERN Stack Project/backend"
    node seed.js

------------------------------------------------------------
 PORT SUMMARY
------------------------------------------------------------

  Backend API:     http://localhost:8000/api
  Frontend (React):http://localhost:3000
  Static images:   http://localhost:8000/listing-images

------------------------------------------------------------
 ENTITY / DATA MODEL SUMMARY
------------------------------------------------------------

  Entities (5):
    1. User    — username, password (hashed), email, name, role
    2. Listing — title, description, price, category, condition,
                 location, status, images, seller (ref: User)
    3. Message — content, sender (ref: User), receiver (ref: User),
                 listing context (ref: Listing)
    4. Event   — title, description, date, time, location,
                 category, status, organizer (ref: User)
    5. RSVP    — user (ref: User), event (ref: Event)
                 [Many-to-Many join entity]

  Many-to-Many Relationship:
    User <---> Event  (via RSVP collection)
    One user can RSVP to many events.
    One event can have many users RSVP'd.

============================================================
