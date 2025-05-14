const express = require('express');
const { registerUser, loginUser, loginRateLimiter } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginRateLimiter, loginUser);

module.exports = router;
