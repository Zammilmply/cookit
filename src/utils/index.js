const initializeAdminCredentials = () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cookit.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  console.log('Admin credentials initialized on the server side:', {
    email: adminEmail,
    password: adminPassword,
  });
};

module.exports = {
  formatDate: (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  },
  validateEnv: () => {
    if (!process.env.JWT_SECRET) {
      throw new Error('Missing JWT_SECRET in environment variables');
    }
    if (!process.env.MONGO_URI) {
      throw new Error('Missing MONGO_URI in environment variables');
    }
  },
  errorHandler: (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  },
  handleAsync: (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },
  initializeAdminCredentials,
};