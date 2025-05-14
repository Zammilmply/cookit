const express = require('express');
const { loginUser, loginAdmin, registerUser, requestPasswordReset, resetPassword } = require('../controllers/authController');

const router = express.Router();

// User authentication routes
router.post('/login', loginUser);

// Route for user registration
router.post('/register', registerUser);

// Admin authentication route
router.post('/admin/login', loginAdmin);

// Forgot password route
router.post('/forgot-password', requestPasswordReset);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router;