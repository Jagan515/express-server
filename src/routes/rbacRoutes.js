const express = require('express');
const rbacController = require('../controllers/rbacController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeMiddleware = require('../middlewares/authorizeMiddleware');

const router = express.Router();

// Protect all RBAC routes
router.use(authMiddleware.protect);

// Create user
router.post(
  '/',
  authorizeMiddleware('users:create'),
  rbacController.create
);

// Update user
router.patch(
  '/',
  authorizeMiddleware('users:update'),
  rbacController.update
);

// Delete user
router.post(
  '/delete',
  authorizeMiddleware('users:delete'),
  rbacController.delete
);

// Get all users
router.get(
  '/',
  authorizeMiddleware('users:view'),
  rbacController.getAllUsers
);

module.exports = router;
