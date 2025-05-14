const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { errorHandler, validateEnv } = require('./utils');
const { initializeAdminCredentials } = require('./utils/initializeAdmin');
const User = require('./models/user');
const authRoutes = require('./routes/auth'); // Ensure auth routes are imported
const recipeRoutes = require('./routes/recipe'); // Include the recipe routes in the application

// Load environment variables
require('dotenv').config();
dotenv.config();

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors()); // Ensure CORS is enabled
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Ensure JSON parsing middleware is included

// Add debug logs to database connection logic
const connectToDatabase = async (retries = 5, delay = 5000) => {
    while (retries) {
        try {
            console.log('Attempting to connect to MongoDB...');
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 30000,
                connectTimeoutMS: 30000,
            });
            console.log('Connected to MongoDB');
            break;
        } catch (err) {
            console.error(`Database connection error: ${err.message}`);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            if (retries === 0) {
                console.error('Could not connect to MongoDB. Exiting.');
                process.exit(1);
            }
            await new Promise((res) => setTimeout(res, delay));
        }
    }
};

connectToDatabase();

// Call the function to initialize admin credentials
initializeAdminCredentials().catch((error) => {
  console.error('Error initializing admin credentials:', error.message);
});

// Log admin credentials if available
const logAdminCredentials = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`Admin ID: ${admin._id}, Admin Password: ${admin.password}`);
    } else {
      console.log('No admin user found.');
    }
  } catch (error) {
    console.error('Error fetching admin credentials:', error.message);
  }
};

logAdminCredentials();

// Middleware to log HTTP methods and routes
app.use((req, res, next) => {
  console.log(`HTTP Method: ${req.method}, Route: ${req.url}`);
  next();
});

// Register routes
app.use('/api/auth', authRoutes); // Ensure this is registered
app.use('/api/recipes', recipeRoutes); // Register recipe routes

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Dynamically load routes
const loadRoutes = (app) => {
  const routesPath = path.join(__dirname, 'routes');
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith('.js')) {
      const route = require(`./routes/${file}`);
      const routeName = file === 'index.js' ? '/' : `/api/${file.replace('.js', '')}`;
      app.use(routeName, route);
    }
  });
};

// Ensure API routes are registered before the catch-all route
loadRoutes(app);

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log('Server is up and running!');
});