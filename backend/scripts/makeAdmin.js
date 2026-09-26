// Promotes an existing user to the admin role. Not an API route — run manually:
//   node backend/scripts/makeAdmin.js someone@example.com
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email ${email}`);
  } else {
    console.log(`${user.email} is now an admin.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed to promote user:', err.message);
  process.exit(1);
});
