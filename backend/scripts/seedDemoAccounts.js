// Creates (or resets the password on) the two demo accounts that LoginPage's
// "Quick Fill Demo Accounts" buttons expect, so the demo login flow actually
// works. Safe to re-run — idempotent, upserts by email.
// Run manually: node backend/scripts/seedDemoAccounts.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const DEMO_ACCOUNTS = [
  { name: 'Demo Citizen', email: 'citizen@example.com', password: 'Password123!', role: 'user' },
  { name: 'Demo Admin', email: 'admin@civicpath.gov', password: 'AdminPassword123!', role: 'admin' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const account of DEMO_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, SALT_ROUNDS);
    await User.findOneAndUpdate(
      { email: account.email },
      { name: account.name, email: account.email, passwordHash, role: account.role },
      { upsert: true, new: true }
    );
    console.log(`Seeded ${account.email} (role: ${account.role}).`);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
