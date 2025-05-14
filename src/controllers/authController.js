const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt'); // Add bcrypt for secure password comparison
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { validateRegistrationInput } = require('../utils/validation');

// Helper to generate JWT
const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

// Helper function to send emails
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

// Modularized helper function for error response
const handleError = (res, statusCode, message) => {
    console.error(message);
    return res.status(statusCode).json({ error: message });
};

// Initialize admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cookit.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

// Log admin credentials in the terminal
console.log(`Admin Login Details:
Email: ${ADMIN_EMAIL}
Password: ${ADMIN_PASSWORD}`);

// User login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare hashed passwords securely
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token, redirect: '/user-dashboard.html' });
    } catch (error) {
        console.error('Error during user login:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin login
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: 'Login successful', token, redirect: '/admin-dashboard.html' });
    } catch (error) {
        console.error('Error during admin login:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Register user
exports.registerUser = async (req, res) => {
    try {
        const { name, email, dob, phone, password } = req.body;

        const username = `${name.slice(0, 4)}${phone.slice(-4)}`;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists. Please try again.' });
        }

        const user = new User({ name, email, dob, phone, username, password }); // Save plain text password
        await user.save();

        res.status(201).json({ message: 'User registered successfully.', redirect: '/user-dashboard.html' });
    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(400).json({ error: error.message });
    }
};

// Middleware to authenticate user
exports.authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Email not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;
        await sendEmail(email, 'Password Reset Request', `Reset your password using this link: ${resetLink}`);
        res.json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('Error during password reset request:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body; // Extract token from body

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        user.password = password; // Save plain text password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error during password reset:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Placeholder for verifyToken
exports.verifyToken = async (req, res) => {
    res.status(501).json({ message: 'verifyToken is not implemented yet.' });
};

console.log('Exporting loginUser:', exports.loginUser);
console.log('Exporting registerUser:', exports.registerUser);