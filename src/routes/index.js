const express = require('express');
const router = express.Router();
const { indexController } = require('../controllers'); // Import the IndexController

// Example route
router.get('/', (req, res) => {
  res.send('Welcome to the Cookit API');
});

// Route to get popular recipes
router.get('/recipes/popular', (req, res) => {
  indexController.getPopularRecipes(req, res);
});

// Route for autocomplete functionality
router.get('/recipes/autocomplete', indexController.autocompleteRecipes);

module.exports = router;