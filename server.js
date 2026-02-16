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

/* MongoDB Connection */
mongoose
  .connect(process.env.MONGO_DB_CONNECTION_URL)
  .then(() => console.log('MongoDB Connected'))
  .catch((error) => console.log('Could not connect MongoDB..', error));

const corsOption = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

app.use(cors(corsOption));

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
