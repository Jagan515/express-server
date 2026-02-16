const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authorizeMiddleware = require('../middlewares/authorizeMiddleware');
const paymentsController = require('../controllers/paymentsController');

/*
  IMPORTANT:
  Webhook must receive raw body.
  It should NOT pass through auth middleware.
*/
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentsController.handleWebhookEvents
);

/*
  All routes below require authentication
*/
router.use(authMiddleware.protect);

router.post(
  '/create-order',
  authorizeMiddleware('payment:create'),
  paymentsController.createOrder
);

router.post(
  '/verify-order',
  authorizeMiddleware('payment:create'),
  paymentsController.verifyOrder
);

router.post(
  '/create-subscription',
  authorizeMiddleware('payment:create'),
  paymentsController.createSubscription
);

router.post(
  '/capture-subscription',
  authorizeMiddleware('payment:create'),
  paymentsController.captureSubscription
);
console.log("handleWebhookEvents:", paymentsController.handleWebhookEvents);
console.log("express.raw:", typeof express.raw);

console.log("cancelSubscription:", paymentsController.cancelSubscription);
console.log("authorizeMiddleware:", authorizeMiddleware);

router.post(
  "/cancel-subscription",
  authorizeMiddleware('payment:cancel'),
  paymentsController.cancelSubscription
);


module.exports = router;
