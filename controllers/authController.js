const User = require('../models/user');
const { validateRegistrationInput } = require('../utils/validation');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

async function registerUser(req, res) {
    try {
        const { name, email, dob, phone, password } = req.body;

        // Validate input
        validateRegistrationInput({ name, email, dob, phone, password });

        // Generate username
        const username = `${name.slice(0, 4)}${phone.slice(-4)}`;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists. Please try again.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the user
        const user = new User({ name, email, dob, phone, username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully.', redirect: '/user-dashboard.html' });
    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(400).json({ error: error.message });
    }
}

async function loginUser(req, res) {
    try {
        const { identifier, password } = req.body; // identifier can be email, phone, or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }, { username: identifier }]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials.');
        }

        res.status(200).json({ message: 'Login successful.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts. Please try again later.'
});

module.exports = { registerUser, loginUser, loginRateLimiter };
