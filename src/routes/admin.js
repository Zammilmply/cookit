const express = require('express');
const User = require('../models/user');
const Recipe = require('../models/recipe');
const { verifyToken, verifyRole, restrictToAdmin } = require('../utils/authMiddleware');

const router = express.Router();

// Protect all admin routes
router.use(verifyToken, verifyRole('admin'));

// Middleware to check admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Get all registered users
router.get('/users', async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.find().select('-password');
    console.log('Users fetched:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all recipes
router.get('/recipes', async (req, res) => {
  try {
    console.log('Fetching all recipes...');
    const recipes = await Recipe.find().populate('author', 'name email');
    console.log('Recipes fetched:', recipes);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Fetch a single recipe by ID
router.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error.message);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Delete a recipe
router.delete('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error.message);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Edit a recipe
router.put('/recipes/:id', async (req, res) => {
  try {
    const { name, ingredients, instructions } = req.body;
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { name, ingredients, instructions },
      { new: true, runValidators: true }
    );
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ message: 'Recipe updated successfully', recipe });
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Get most liked and most viewed recipes
router.get('/recipes/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const mostLiked = await Recipe.find().sort({ likes: -1 }).limit(5);
    const mostViewed = await Recipe.find().sort({ views: -1 }).limit(5);

    // Fetch recently viewed recipes (assuming a 'recentViews' field exists)
    const recentlyViewed = await Recipe.find().sort({ recentViews: -1 }).limit(5);

    // Use Spoonacular API to fetch additional details for recently viewed recipes
    const spoonacularApiKey = process.env.SPOONACULAR_API_KEY;
    const fetchRecipeDetails = async (recipeId) => {
      try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${spoonacularApiKey}`);
        if (!response.ok) {
          console.error(`Failed to fetch details for recipe ${recipeId}:`, response.statusText);
          return { error: `Failed to fetch details for recipe ${recipeId}` };
        }
        return await response.json();
      } catch (error) {
        console.error(`Error fetching details for recipe ${recipeId}:`, error.message);
        return { error: `Error fetching details for recipe ${recipeId}` };
      }
    };

    const detailedRecentlyViewed = await Promise.all(
      recentlyViewed.map(async (recipe) => {
        const details = await fetchRecipeDetails(recipe.spoonacularId);
        return { ...recipe.toObject(), spoonacularDetails: details };
      })
    );

    res.json({ mostLiked, mostViewed, recentlyViewed: detailedRecentlyViewed });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add endpoint to fetch recipe statistics
router.get('/recipes/statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('Fetching recipe statistics...');
    const totalRecipes = await Recipe.countDocuments();
    const totalLikes = await Recipe.aggregate([
      { $group: { _id: null, totalLikes: { $sum: "$likes" } } },
    ]);
    console.log('Recipe statistics fetched:', { totalRecipes, totalLikes });
    res.json({ totalRecipes, totalLikes: totalLikes[0]?.totalLikes || 0 });
  } catch (error) {
    console.error('Error fetching recipe statistics:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Add endpoint to fetch details
router.get('/details', async (req, res) => {
  try {
    const details = await Recipe.find().populate('author', 'name email'); // Example: Fetch recipes with author details
    res.json(details);
  } catch (error) {
    console.error('Error fetching details:', error.message);
    res.status(500).json({ error: 'Failed to fetch details' });
  }
});

// Add endpoint to fetch recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(10).populate('user', 'name');
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error.message);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Fetch user login data for the chart
router.get('/user-logins', async (req, res) => {
  try {
    const logins = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dates = logins.map(login => login._id);
    const counts = logins.map(login => login.count);

    res.json({ dates, counts });
  } catch (error) {
    console.error('Error fetching user login data:', error.message);
    res.status(500).json({ error: 'Failed to fetch user login data' });
  }
});

// Fetch recently registered users
router.get('/recent-users', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name registeredAt');

    res.json(users);
  } catch (error) {
    console.error('Error fetching recently registered users:', error.message);
    res.status(500).json({ error: 'Failed to fetch recently registered users' });
  }
});

// Example admin route
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard' });
});

module.exports = router;