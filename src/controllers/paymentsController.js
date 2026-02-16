const Razorpay = require('razorpay');
const crypto = require('crypto');

const {
  CREDIT_TO_PAISA_MAPPING,
  PAISA_TO_CREDIT_MAPPING,
  PLAN_IDS
} = require('../constants/paymentConstants');

const Users = require('../models/User');

const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentsController = {

  // -------------------------
  // Create Order (Credits)
  // -------------------------
  createOrder: async (request, response) => {
    try {
      const credits = Number(request.body.credits);

      const amountInPaise = CREDIT_TO_PAISA_MAPPING.get(credits);

      if (!amountInPaise) {
        return response.status(400).json({
          message: 'Invalid credit value'
        });
      }

      const order = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });

      return response.json({ order });

    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // -------------------------
  // Verify Order (Credits)
  // -------------------------
  verifyOrder: async (request, response) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = request.body;

      const body = razorpay_order_id + '|' + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return response.status(400).json({
          message: 'Invalid transaction'
        });
      }

      const payment = await razorpayClient.payments.fetch(razorpay_payment_id);

      const creditsToAdd = PAISA_TO_CREDIT_MAPPING.get(payment.amount);

      if (!creditsToAdd) {
        return response.status(400).json({
          message: 'Invalid payment amount'
        });
      }

      const user = await Users.findById(request.user._id);

      user.credits += creditsToAdd;
      await user.save();

      return response.json({ user });

    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // -------------------------
  // Create Subscription
  // -------------------------
  createSubscription: async (request, response) => {
    try {
      const { plan_name } = request.body;

      if (!PLAN_IDS[plan_name]) {
        return response.status(400).json({
          message: 'Invalid plan selected'
        });
      }

      const plan = PLAN_IDS[plan_name];

      if (!plan.totalBillCycleCount) {
        return response.status(400).json({
          message: 'Billing cycle count missing'
        });
      }

      const subscription = await razorpayClient.subscriptions.create({
        plan_id: plan.id,
        customer_notify: 1,
        total_count: plan.totalBillCycleCount,
        notes: {
          userId: request.user._id
        }
      });

      return response.json({ subscription });

    } catch (error) {
      console.log("Create Subscription Error:", error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // -------------------------
  // Capture Subscription
  // -------------------------
  captureSubscription: async (request, response) => {
    try {
      const { subscriptionId } = request.body;

      const subscription = await razorpayClient.subscriptions.fetch(subscriptionId);

      const user = await Users.findById(request.user._id);

      user.subscription = {
        subscriptionId: subscriptionId,
        planId: subscription.plan_id,
        status: subscription.status
      };

      await user.save();

      return response.json({ user });

    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // -------------------------
  // Cancel Subscription
  // -------------------------
  cancelSubscription: async (request, response) => {
    try {
      const user = await Users.findById(request.user._id);

      if (!user || user.subscription?.status !== 'active') {
        return response.status(400).json({
          message: 'No active subscription found'
        });
      }

      await razorpayClient.subscriptions.cancel(
        user.subscription.subscriptionId
      );

      // Mark as pending cancel until webhook confirms
      user.subscription.status = "pending_cancel";
      await user.save();

      return response.json({
        message: "Cancellation scheduled successfully"
      });

    } catch (error) {
      console.log("Cancel Error:", error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // -------------------------
  // Webhook Handler
  // -------------------------
  handleWebhookEvents: async (request, response) => {
    try {
      const signature = request.headers['x-razorpay-signature'];
      const rawBody = request.body;

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return response.status(400).send('Invalid signature');
      }

      const payload = JSON.parse(rawBody);

      const event = payload.event;
      const subscriptionData = payload.payload.subscription.entity;

      const userId = subscriptionData.notes?.userId;

      if (!userId) {
        return response.status(400).send('UserID not found');
      }

      let newStatus;

      switch (event) {
        case 'subscription.activated':
          newStatus = 'active';
          break;

        case 'subscription.pending':
          newStatus = 'pending';
          break;

        case 'subscription.cancelled':
          newStatus = 'cancelled';
          break;

        case 'subscription.completed':
          newStatus = 'completed';
          break;

        default:
          return response.status(200).send('Unhandled event');
      }

      await Users.findByIdAndUpdate(
        userId,
        {
          $set: {
            'subscription.subscriptionId': subscriptionData.id,
            'subscription.planId': subscriptionData.plan_id,
            'subscription.status': newStatus
          }
        },
        { new: true }
      );

      return response.status(200).send('Webhook processed');

    } catch (error) {
      console.log(error);
      return response.status(500).send('Internal server error');
    }
  }

};

module.exports = paymentsController;
