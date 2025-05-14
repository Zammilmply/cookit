const express = require('express');
const User = require('../models/user');
const Recipe = require('../models/recipe');
const { verifyToken, verifyRole } = require('../utils/authMiddleware');

const router = express.Router();

// Protect all user routes
router.use(verifyToken, verifyRole('user'));

// Get user dashboard information
router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const addedRecipes = await Recipe.find({ author: req.user.id });
    const likedRecipes = await Recipe.find({ likes: { $gt: 0 } });

    res.json({
      user,
      addedRecipes,
      likedRecipes,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, phone, dob } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, dob },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Old password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get favorites
router.get('/favorites', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a favorite recipe
router.post('/favorites', async (req, res) => {
  try {
    const { recipeId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }
    res.json({ message: 'Recipe added to favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a favorite recipe
router.delete('/favorites/:id', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(fav => fav.toString() !== req.params.id);
    await user.save();
    res.json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user recipes
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user.id });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user recipe
router.delete('/recipes/:id', async (req, res) => {
  try {
    console.log('Delete request received for recipe ID:', req.params.id);
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!recipe) {
      console.log('Recipe not found or not authorized');
      return res.status(404).json({ error: 'Recipe not found or not authorized' });
    }

    console.log('Recipe deleted successfully');
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;