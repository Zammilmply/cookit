const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user');

dotenv.config(); // Load environment variables from .env file

// Update the email and password to test with the correct user
const email = 'testuser@example.com';
const plainTextPassword = 'TestPassword@123'; // Correct password used during registration

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Query the database for the correct user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
        } else {
            console.log('User found:', user);

            // Test bcrypt.compare with the correct user
            const isMatch = await bcrypt.compare(plainTextPassword, user.password);
            console.log('Password comparison result:', isMatch);
        }
    } catch (error) {
        console.error('Error during script execution:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Rehash the plain text password and compare it with the stored hash
async function rehashAndCompare() {
    const plainTextPassword = 'NewUser@123';
    const storedHashedPassword = '$2b$10$09x2eOXyW9BvcLUG5i2XYOrA1xCV7EuxMtojxibRnHYGqr0cby8ia';

    console.log('Plain text password:', plainTextPassword);
    console.log('Stored hashed password:', storedHashedPassword);

    try {
        console.log('Rehashing the plain text password for comparison...');
        const rehashedPassword = await bcrypt.hash(plainTextPassword, 10);
        console.log('Rehashed password:', rehashedPassword);

        console.log('Comparing plain text password with stored hash...');
        const isMatch = await bcrypt.compare(plainTextPassword, storedHashedPassword);
        console.log('Password comparison result:', isMatch);
    } catch (error) {
        console.error('Error during rehashing and comparison:', error);
    }
}

// Function to manually test password comparison
async function testPasswordComparison() {
    const plainTextPassword = 'TestPassword@123'; // Replace with the password you want to test
    const storedHashedPassword = '$2b$10$tGwSoRZ6i2Mz91B5dKF1fuTknVTfGQX9S7NmlB1/8u11IeOb4q8SS'; // Replace with the stored hash

    console.log('Plain text password:', plainTextPassword);
    console.log('Stored hashed password:', storedHashedPassword);

    try {
        console.log('Rehashing the plain text password for comparison...');
        const rehashedPassword = await bcrypt.hash(plainTextPassword, 10);
        console.log('Rehashed password:', rehashedPassword);

        console.log('Comparing plain text password with stored hash...');
        const isMatch = await bcrypt.compare(plainTextPassword, storedHashedPassword);
        console.log('Password comparison result:', isMatch);
    } catch (error) {
        console.error('Error during password comparison:', error);
    }
}

main();
rehashAndCompare();
testPasswordComparison();