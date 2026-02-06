const express = require('express');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeMiddleware = require('../middlewares/authorizeMiddleware');
const groupMemberMiddleware = require('../middlewares/groupMemberMiddleware');

const router = express.Router();

// Protect all expense routes
router.use(authMiddleware.protect);

// Add expense to a group
router.post(
    '/add',
    authorizeMiddleware('groups:update'),
    groupMemberMiddleware,
    expenseController.add
);

// Get all expenses of a group
router.get(
    '/group/:groupId',
    authorizeMiddleware('groups:view'),
    expenseController.getByGroup
);

// Get expense summary for a group
router.get(
    '/group/:groupId/summary',
    authorizeMiddleware('groups:view'),
    expenseController.summary
);

// Settle group expenses
router.post(
    '/group/:groupId/settle',
    authorizeMiddleware('groups:update'),
    expenseController.settle
);

module.exports = router;
