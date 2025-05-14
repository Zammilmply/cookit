require('dotenv').config(); // Ensure environment variables are loaded
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');

const email = 'testuser@example.com'; // Replace with the email to test
const plainTextPassword = 'TestPassword@123'; // Replace with the correct password

(async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in the environment variables.');
        }

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return;
        }

        console.log('User retrieved:', user);

        // Hash the plain text password for comparison
        const hashedPassword = await bcrypt.hash(plainTextPassword, 10);
        console.log('Hashed plain text password:', hashedPassword);

        // Compare the plain text password with the stored hash
        const isMatch = await bcrypt.compare(plainTextPassword, user.password);
        console.log('Password comparison result:', isMatch);
    } catch (error) {
        console.error('Error during password test:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
})();
