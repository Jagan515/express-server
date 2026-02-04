const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

//  Protect all group routes
router.use(authMiddleware.protect);
router.post('/create', groupController.create);
router.put('/update', groupController.update);
router.patch('/members/add', groupController.addMembers);
router.patch('/members/remove', groupController.removeMembers);
router.get('/my-groups', groupController.getGroupsByUser);
router.get('/status', groupController.getGroupsByPaymentStatus);
router.get('/:groupId/audit', groupController.getAudit);

module.exports = router;
