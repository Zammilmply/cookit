const { check, validationResult } = require('express-validator');

// Add logging to handleValidationErrors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Updated validateRegistration with centralized error handling
exports.validateRegistration = [
    check('username').notEmpty().withMessage('Username is required'),
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Invalid email address'),
    check('password')
        .isLength({ min: 8 }) // Change minimum length to 8
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must include uppercase, lowercase, numbers, and symbols'),
    check('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'), // Ensure passwords match
    handleValidationErrors,
];

// Updated validateLogin to validate `email` instead of `identifier`
exports.validateLogin = [
    check('email').isEmail().withMessage('Invalid email address'), // Ensure 'email' is validated
    check('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
];

// Updated validatePasswordReset with centralized error handling
exports.validatePasswordReset = [
    check('password')
        .isLength({ min: 8 }) // Change minimum length to 8
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must include uppercase, lowercase, numbers, and symbols'),
    handleValidationErrors,
];