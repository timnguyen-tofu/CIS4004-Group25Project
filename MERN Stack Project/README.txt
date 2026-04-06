Knight Market — UCF Student Marketplace
CIS 4004 | Group 25 | Spring 2026


REQUIREMENTS
------------
- Node.js v18+  →  https://nodejs.org
- MongoDB (pick one):
    Local  — install MongoDB Community  →  https://www.mongodb.com/try/download/community
    Cloud  — create a free Atlas cluster  →  https://www.mongodb.com/atlas


SETUP
-----
1. configure backend env

    copy backend/.env.example to backend/.env and fill in:

    MONGO_URI=mongodb://localhost:27017/knight-market   ← local
    MONGO_URI=mongodb+srv://<user>:<pass>@cluster...    ← atlas
    JWT_SECRET=any_long_random_string
    PORT=8000

2. install dependencies (do this once)

    cd backend   →  npm install
    cd frontend  →  npm install


START
-----
need two terminals running at the same time

  terminal 1 — backend
    cd backend
    npm run dev

  terminal 2 — frontend
    cd frontend
    npm start

  open browser  →  http://localhost:3000


SEED DATA
---------
runs automatically on every server start — no manual steps needed

creates on first boot:
  - admin user   →  admin / admin
  - student user →  student / student
  - 15 sample listings with images
  - 2 campus events
  - 10 default categories

safe to restart — skips anything that already exists


PORTS
-----
  frontend   →  http://localhost:3000
  backend    →  http://localhost:8000
  images     →  http://localhost:8000/listing-images


COLLECTIONS
-----------
  users, listings, messages, events, rsvps, categories
  all created automatically by mongoose — no manual setup
