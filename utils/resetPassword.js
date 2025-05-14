require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');

const email = 'testuser@example.com'; // Replace with the user's email
const newPassword = 'TestPassword@123'; // Replace with the new password

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

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true, runValidators: false } // Skip validation for other fields
        );

        if (!user) {
            console.log('User not found for email:', email);
            return;
        }

        console.log(`Password reset successfully for user: ${email}`);
    } catch (error) {
        console.error('Error during password reset:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
})();
