
const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout',authController.logout);
router.post('/is-user-logged-in',authController.isUserLoggedIn);
router.post('/google-auth',authController.googleSso);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", authController.changePassword);


module.exports = router;  

