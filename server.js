require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const requestRoutes = require('./routes/requests');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ----- Middleware -----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- Routes -----
app.get('/', (req, res) => {
  res.json({ message: 'CareConnect API is running.' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected: mongoose.connection.readyState === 1
  });
});

app.use('/api/requests', requestRoutes);

// ----- 404 handler -----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ----- Global error handler -----
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ----- Start server -----
async function start() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set. Create a .env file based on .env.example.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`CareConnect API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();