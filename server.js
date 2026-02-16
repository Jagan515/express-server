require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/authRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const paymentsRoutes = require('./src/routes/paymentRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const rbacRoutes = require('./src/routes/rbacRoutes');

const app = express();

const corsOption = {
  origin: (origin, callback) => {
    // If no origin (like mobile apps or curl), allow it
    if (!origin) return callback(null, true);

    const clientUrl = process.env.CLIENT_URL;

    if (origin === clientUrl || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOption));

/* MongoDB Connection Management */
let isConnected = false;





const connectToDatabase = async (req, res, next) => {
  if (isConnected) {
    return next();
  }

  try {
    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('MongoDB Connected');
    next();
  } catch (error) {
    console.log('Could not connect MongoDB..', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
};

// Ensure database is connected before any routing
app.use(connectToDatabase);

/*
  Apply express.json() to all routes
  EXCEPT /payments/webhook
*/
app.use((request, response, next) => {
  if (request.originalUrl.startsWith('/payments/webhook')) {
    return next();
  }
  express.json()(request, response, next);
});

app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);
app.use('/users', rbacRoutes);
app.use('/expenses', expenseRoutes);
app.use('/payments', paymentsRoutes);
app.use('/profile', profileRoutes);

/* Export instead of listen */
module.exports = app;
