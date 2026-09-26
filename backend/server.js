require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');
const tasksRoutes = require('./routes/tasks.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Simple boot check — confirms the server is up and the DB connection state.
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { dbState: mongoose.connection.readyState } });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`CivicPath backend listening on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
