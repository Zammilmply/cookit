// Import React and useState for managing component state
import React, { useState } from 'react';

// Component for user registration form
const RegisterForm = () => {
    // State to manage form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: '',
        phone: '',
        password: ''
    });
    // State to manage error messages
    const [error, setError] = useState('');
    // State to manage success messages
    const [success, setSuccess] = useState('');

    // Function to handle input changes and update state
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Function to validate user inputs before submission
    const validateInputs = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[6-9]\d{9}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!formData.name || !formData.email || !formData.dob || !formData.phone || !formData.password) {
            return 'All fields are required.';
        }
        if (!emailRegex.test(formData.email)) {
            return 'Invalid email format.';
        }
        if (!phoneRegex.test(formData.phone)) {
            return 'Invalid phone number format.';
        }
        const age = Math.floor((Date.now() - new Date(formData.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) {
            return 'You must be at least 18 years old.';
        }
        if (!passwordRegex.test(formData.password)) {
            return 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
        }
        return null;
    };

    // Function to handle form submission and send data to the server
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateInputs();
        if (validationError) {
            setError(validationError);
            return;
        }
        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.message);
                setError('');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    // Render the registration form with input fields and validation messages
    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} />
            <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            <button type="submit">Register</button>
        </form>
    );
};

export default RegisterForm;
