require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = [
    {
      username: 'admin',
      password: 'admin',
      email: 'admin@knightmarket.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    },
    {
      username: 'student',
      password: 'student',
      email: 'student@knightmarket.com',
      firstName: 'Student',
      lastName: 'User',
      role: 'user'
    }
  ];

  for (const u of users) {
    const exists = await User.findOne({ username: u.username });
    if (exists) {
      console.log(`User "${u.username}" already exists, skipping.`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`Created user: ${u.username} (role: ${u.role})`);
  }

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
