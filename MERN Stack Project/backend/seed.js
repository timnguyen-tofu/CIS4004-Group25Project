const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Category = require('./models/Category');
const Listing = require('./models/Listing');
const Event = require('./models/Event');

const imagesDir = path.join(__dirname, 'listing-images');
const seedImagesDir = path.join(__dirname, 'seed-images');
const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

// copies from seed-images/<num>/, returns saved filenames
function copyListingImages(num) {
  const srcDir = path.join(seedImagesDir, String(num).padStart(2, '0'));
  if (!fs.existsSync(srcDir)) return [];

  const files = fs.readdirSync(srcDir)
    .filter(f => imageExts.has(path.extname(f).toLowerCase()))
    .slice(0, 5);

  const filenames = [];
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const destName = `seed_listing_${String(num).padStart(2, '0')}_img_${filenames.length + 1}${ext}`;
    const destPath = path.join(imagesDir, destName);
    if (!fs.existsSync(destPath)) fs.copyFileSync(path.join(srcDir, file), destPath);
    filenames.push(destName);
  }
  return filenames;
}

const users = [
  { username: 'admin',   password: 'admin',   email: 'admin@knightmarket.com',   firstName: 'Admin',   lastName: 'User', role: 'admin' },
  { username: 'student', password: 'student', email: 'student@knightmarket.com', firstName: 'Student', lastName: 'User', role: 'user'  }
];

const categories = [
  'Textbooks', 'Electronics', 'Furniture', 'Clothing',
  'Gaming', 'Rides', 'Sports', 'Music', 'Dorm Essentials', 'Other'
];

// folder 01 = first listing, 02 = second, etc.
const listings = [
  { title: 'Calculus Textbook (OpenStax)',     category: 'Textbooks',       price: 25,  condition: 'Good',     location: 'UCF Main Campus',       description: 'Calculus: Early Transcendentals, lightly highlighted. Great for MAC 2311.' },
  { title: 'Physics Textbook (Serway)',         category: 'Textbooks',       price: 40,  condition: 'Like New', location: 'UCF Main Campus',       description: 'Physics for Scientists and Engineers, 9th edition. No writing inside.' },
  { title: 'MacBook Pro 13" 2021 (M1)',         category: 'Electronics',     price: 850, condition: 'Like New', location: 'UCF Library',            description: 'M1 chip, 8GB RAM, 256GB SSD. Battery health 95%. Includes charger.' },
  { title: 'iPhone 13 128GB (Unlocked)',        category: 'Electronics',     price: 450, condition: 'Good',     location: 'UCF Main Campus',       description: 'Fully unlocked, works with any carrier. Minor scratches on back. Comes with cable.' },
  { title: 'IKEA RANARP Desk Lamp',             category: 'Furniture',       price: 15,  condition: 'Good',     location: 'Nike Hall',             description: 'Adjustable arm desk lamp, off-white. Works perfectly, small scuff on base.' },
  { title: 'IKEA MICKE Study Desk',             category: 'Furniture',       price: 60,  condition: 'Fair',     location: 'Towers Dorms',          description: 'White, 73x50 cm. Pull-out panel for extra workspace. Some wear on surface.' },
  { title: 'Nike Air Zoom Pegasus (Size 10)',   category: 'Clothing',        price: 35,  condition: 'Good',     location: 'Recreation & Wellness', description: "Men's size 10 running shoes. Worn for one semester of casual use. Still comfortable." },
  { title: 'UCF Knights Hoodie (Medium)',       category: 'Clothing',        price: 20,  condition: 'Like New', location: 'UCF Student Union',     description: 'Black UCF Knights hoodie, size M. Worn twice. Perfect for game day.' },
  { title: 'PS5 DualSense Controller',          category: 'Gaming',          price: 45,  condition: 'Good',     location: 'UCF Main Campus',       description: 'Midnight Black DualSense. Light drift on left stick — still very playable. Includes USB cable.' },
  { title: 'Nintendo Switch + 3 Games',         category: 'Gaming',          price: 220, condition: 'Good',     location: 'UCF Garage A',          description: 'Switch (original) with Mario Kart 8, Zelda BOTW, and Smash Bros. Joy-cons work great.' },
  { title: 'Carpool to MCO Airport',            category: 'Rides',           price: 10,  condition: 'New',      location: 'UCF Main Campus',       description: 'Offering rides to Orlando International Airport (MCO). Available most mornings. DM to schedule.' },
  { title: 'Lululemon Yoga Mat',                category: 'Sports',          price: 18,  condition: 'Like New', location: 'Recreation & Wellness', description: '5mm thick, non-slip surface. Barely used — switched to a thicker mat.' },
  { title: 'Fender Acoustic Guitar (CD-60S)',   category: 'Music',           price: 120, condition: 'Good',     location: 'UCF Main Campus',       description: 'Great beginner/intermediate acoustic. All solid mahogany top. Comes with gig bag and extra strings.' },
  { title: 'Galanz 3.1 cu ft Mini Fridge',      category: 'Dorm Essentials', price: 65,  condition: 'Good',     location: 'Towers Dorms',          description: 'Perfect dorm fridge. Freezer compartment, adjustable thermostat. Works great, just upgrading.' },
  { title: 'TI-84 Plus Graphing Calculator',    category: 'Other',           price: 55,  condition: 'Good',     location: 'UCF Main Campus',       description: 'Texas Instruments TI-84 Plus. Required for many UCF math/engineering courses. Includes USB cable.' },
];

// dates calc'd at runtime so they're always in the future
function getEvents(adminId) {
  const now = Date.now();
  return [
    {
      title: 'UCF Tech & Career Fair',
      description: 'Connect with 50+ tech companies recruiting UCF students for internships and full-time roles. Bring printed résumés and dress business casual.',
      date: new Date(now + 14 * 24 * 60 * 60 * 1000),
      time: '10:00 AM - 3:00 PM',
      location: 'CFE Arena, UCF Main Campus',
      category: 'Career',
      status: 'published',
      organizer: adminId
    },
    {
      title: 'Knight Market Swap Meet',
      description: 'End-of-semester swap meet hosted by Knight Market. Bring items to sell, trade, or give away. Free entry for all UCF students.',
      date: new Date(now + 30 * 24 * 60 * 60 * 1000),
      time: '11:00 AM - 4:00 PM',
      location: 'UCF Memory Mall',
      category: 'Social',
      status: 'published',
      organizer: adminId
    }
  ];
}

async function seed() {
  console.log('Running seed...');

  // seed users
  const savedUsers = {};
  for (const u of users) {
    let existing = await User.findOne({ username: u.username });
    if (!existing) {
      const hashed = await bcrypt.hash(u.password, 10);
      existing = await User.create({ ...u, password: hashed });
      console.log(`Created user: ${u.username}`);
    }
    savedUsers[u.username] = existing;
  }

  // seed categories
  for (const name of categories) {
    if (!await Category.findOne({ name })) {
      await Category.create({ name });
      console.log(`Created category: ${name}`);
    }
  }

  // ensure output dir exists
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  // seed listings, alternate seller between admin and student
  const sellers = [savedUsers.admin, savedUsers.student];
  for (let i = 0; i < listings.length; i++) {
    const data = listings[i];
    if (await Listing.findOne({ title: data.title })) continue;
    const images = copyListingImages(i + 1);
    await Listing.create({ ...data, seller: sellers[i % 2]._id, status: 'active', images });
    console.log(`Created listing: ${data.title}`);
  }

  // seed events
  for (const ev of getEvents(savedUsers.admin._id)) {
    if (!await Event.findOne({ title: ev.title })) {
      await Event.create(ev);
      console.log(`Created event: ${ev.title}`);
    }
  }

  console.log('Seed done.');
}

module.exports = seed;

// run directly: node seed.js
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => { await seed(); await mongoose.disconnect(); })
    .catch(err => { console.error(err); process.exit(1); });
}
