const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const usersController = require('../controllers/profileController');
const authorizeMiddleware = require('../middlewares/authorizeMiddleware');
console.log('authMiddleware import:', authMiddleware);

router.use(authMiddleware.protect);

router.get('/get-user-info', usersController.getUserInfo);
router.put("/update-name", authorizeMiddleware('profile:update'),usersController.updateName);


module.exports = router;
