const mongoose = require('mongoose');

/*
  Subscription Subdocument Schema
*/
const subscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: String }, // Razorpay subscription id
  planId: { type: String }, // Plan id (monthly/yearly)
  status: { type: String }, // created, active, cancelled, completed, etc.
  start: { type: Date }, // Subscription start date
  end: { type: Date }, // Subscription end date
  lastBillDate: { type: Date }, // Last payment date
  nextBillDate: { type: Date }, // Next billing date
  paymentsMade: { type: Number }, // Total payments made
  paymentsRemaining: { type: Number }, // Remaining billing cycles
});

/*
  User Schema
*/
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String },

  googleId: { type: String, required: false },

  resetOtp: { type: String },

  resetOtpExpiry: { type: Date },

  resetPasswordLastRequestedAt: { type: Date },

  role: { type: String, required: true, default: 'admin' },

  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },

  // Default to 1 to give free trial of creating 1 group
  credits: { type: Number, default: 1 },

  subscription: {
    type: subscriptionSchema,
    required: false,
  },
});

module.exports = mongoose.model('User', userSchema);
