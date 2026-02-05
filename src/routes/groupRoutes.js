const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeMiddleware = require('../middlewares/authorizeMiddleware');

const router = express.Router();

//  Protect all group routes
router.use(authMiddleware.protect);
router.post('/create', authorizeMiddleware('groups:create'),groupController.create);
router.put('/update', authorizeMiddleware('groups:update'),groupController.update);
router.patch('/members/add', authorizeMiddleware('groups:update'),groupController.addMembers);
router.patch('/members/remove', authorizeMiddleware('groups:update'),groupController.removeMembers);
router.get('/my-groups', authorizeMiddleware('groups:view'),groupController.getGroupsByUser);
router.get('/status', authorizeMiddleware('groups:view'),groupController.getGroupsByPaymentStatus);
router.get('/:groupId/audit', authorizeMiddleware('groups:view'),groupController.getAudit);

module.exports = router;
