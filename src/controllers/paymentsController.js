const Razorpay = require('razorpay');
const { CREDIT_TO_PAISA_MAPPING } = require('../constants/paymentConstants');
const crypto = require('crypto');
const users = require('../models/User');

const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentsController = {
  // Step-2 from sequence diagram
  createOrder: async (request, response) => {
  try {
    
    const credits = Number(request.body.credits);

    
    if (!Number.isInteger(credits)) {
      return response.status(400).json({
        message: 'Invalid credit value',
      });
    }

    
    const amountInPaise = CREDIT_TO_PAISA_MAPPING.get(credits);

    if (!amountInPaise) {
      return response.status(400).json({
        message: 'Invalid credit value',
      });
    }

    const order = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    return response.status(200).json({ order });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: 'Internal server error' });
  }
},
  // Step-8 from sequence diagram
  verifyOrder: async (request, response) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        credits,
      } = request.body;

      const body = razorpay_order_id + '|' + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return response.status(400).json({
          message: 'Invalid transaction',
        });
      }

      const user = await users.findById(request.user._id);
      user.credits += Number(credits);
      await user.save();

      return response.json({ user });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Internal server error' });
    }
  },
};

module.exports = paymentsController;
