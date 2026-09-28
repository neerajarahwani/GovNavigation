const jwt = require('jsonwebtoken');

// Like authenticate, but a missing/invalid token isn't an error — it just
// leaves req.user unset. Used by public routes that personalize their
// response (e.g. per-user unread state) when the caller happens to be logged in.
function authenticateOptional(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, role: payload.role };
  } catch (err) {
    // Ignore — treat as anonymous.
  }
  next();
}

module.exports = authenticateOptional;
