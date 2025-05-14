const User = require('../models/user');

async function initializeAdminCredentials() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cookit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123!';

    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (existingAdmin) {
        console.log('Admin credentials already exist.');
        return;
    }

    const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
    });

    await admin.save();
    console.log(`Admin credentials initialized: Email: ${adminEmail}, Password: ${adminPassword}`);
}

module.exports = { initializeAdminCredentials };
