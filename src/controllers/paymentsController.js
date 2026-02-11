const Razorpay = require('razorpay');
const crypto = require('crypto');
const { CREDIT_TO_PAISA_MAPPING, PLAN_IDS } = require('../constants/paymentConstants');
const users = require('../models/User');

const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentsController = {

  // Create Order (Credit Purchase)
  createOrder: async (request, response) => {
    try {
      const credits = Number(request.body.credits);

      if (!Number.isInteger(credits)) {
        return response.status(400).json({ message: 'Invalid credit value' });
      }

      const amountInPaise = CREDIT_TO_PAISA_MAPPING.get(credits);

      if (!amountInPaise) {
        return response.status(400).json({ message: 'Invalid credit value' });
      }

      const order = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      });

      return response.status(200).json({ order });

    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // Verify Order (Credit Payment Verification)
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
        return response.status(400).json({ message: 'Invalid transaction' });
      }

      const user = await users.findById(request.user._id);

      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      user.credits += Number(credits);
      await user.save();

      return response.json({ user });

    } catch (error) {
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // Create Subscription
  createSubscription: async (request, response) => {
    try {
      const { plan_name } = request.body;

      if (!PLAN_IDS[plan_name]) {
        return response.status(400).json({ message: 'Invalid plan selected' });
      }

      const plan = PLAN_IDS[plan_name];

      const subscription = await razorpayClient.subscriptions.create({
        plan_id: plan.id,
        customer_notify: 1,
        total_count: plan.totalBillingCycleCount,
        notes: {
          userId: request.user._id,
        },
      });

      return response.json({ subscription });

    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // Capture Subscription After Checkout
  captureSubscription: async (request, response) => {
    try {
      const { subscriptionId } = request.body;

      const subscription = await razorpayClient.subscriptions.fetch(subscriptionId);

      const user = await users.findById(request.user._id);

      if (!user) {
        return response.status(404).json({ message: 'User not found' });
      }

      user.subscription = {
        subscriptionId: subscriptionId,
        planId: subscription.plan_id,
        status: subscription.status,
      };

      await user.save();

      return response.json({ user });

    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Internal server error' });
    }
  },

  // Razorpay Webhook Handler
  handleWebhookEvents: async (request, response) => {
    try {
      console.log('Received Event');

      // Requires express.raw middleware for webhook route
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

      const razorpaySubscriptionId = subscriptionData.id;
      const userId = subscriptionData.notes?.userId;

      if (!userId) {
        console.log('UserID not found in notes');
        return response.status(400).send('UserID not found in notes');
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
          console.log(`Unhandled event received ${event}`);
          return response.status(200).send(`Unhandled event received ${event}`);
      }

      const user = await users.findByIdAndUpdate(
        userId,
        {
          $set: {
            'subscription.subscriptionId': razorpaySubscriptionId,
            'subscription.status': newStatus,
            'subscription.planId': subscriptionData.plan_id,
            'subscription.start': subscriptionData.start_at
              ? new Date(subscriptionData.start_at * 1000)
              : null,
            'subscription.end': subscriptionData.current_end
              ? new Date(subscriptionData.current_end * 1000)
              : null,
            'subscription.lastBillDate': subscriptionData.current_start
              ? new Date(subscriptionData.current_start * 1000)
              : null,
            'subscription.nextBillDate': subscriptionData.current_end
              ? new Date(subscriptionData.current_end * 1000)
              : null,
            'subscription.paymentsMade': subscriptionData.paid_count,
            'subscription.paymentsRemaining': subscriptionData.remaining_count,
          },
        },
        { new: true }
      );

      if (!user) {
        return response.status(400).send('No user with provided userID exists');
      }

      console.log(`Updated subscription for ${user.email} to ${newStatus}`);

      return response
        .status(200)
        .send(`Event processed for user ${user.email}`);

    } catch (error) {
      console.log(error);
      return response.status(500).send('Internal server error');
    }
  },

};

module.exports = paymentsController;
