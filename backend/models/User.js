const mongoose = require('mongoose');

// Account for both citizens and admins — role defaults to "user", never client-settable.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // Announcements this user has seen — drives the bell's per-user unread count.
    readAnnouncementIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
