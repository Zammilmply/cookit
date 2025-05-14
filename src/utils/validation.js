const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

function validateRegistrationInput({ name, email, dob, phone, password }) {
    if (!name || !email || !dob || !phone || !password) {
        throw new Error('All fields are required.');
    }

    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format.');
    }

    if (!phoneRegex.test(phone)) {
        throw new Error('Invalid phone number format.');
    }

    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
        throw new Error('You must be at least 18 years old.');
    }

    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
    }
}

module.exports = { validateRegistrationInput };
