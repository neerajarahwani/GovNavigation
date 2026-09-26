const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Creates a new user account. Role always defaults to "user" — never client-settable.
async function signup(req, res) {
  const { name, email, password } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'A valid email is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ success: false, error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

  return res.status(201).json({
    success: true,
    data: { userId: user._id, name: user.name, email: user.email, role: user.role },
  });
}

// Verifies email + password and returns a JWT. Same generic 401 for "no such email"
// and "wrong password" so a caller can't tell which one failed.
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!isValidEmail(email) || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  const genericError = () =>
    res.status(401).json({ success: false, error: 'Invalid email or password' });

  if (!user) return genericError();

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return genericError();

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  return res.status(200).json({
    success: true,
    data: { token, user: { userId: user._id, name: user.name, role: user.role } },
  });
}

module.exports = { signup, login };
