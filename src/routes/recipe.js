const express = require('express');
const Recipe = require('../models/recipe');
const { verifyToken } = require('../utils/authMiddleware');
const axios = require('axios');
const { handleAsync } = require('../utils');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

const router = express.Router();

const apiKey = 'e56699063aea49b7a2412c77e0874d92';

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/recipes');
        fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Add a new recipe
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { name, ingredients, instructions, calories, protein, fat, carbs } = req.body;

        if (!name || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Name, ingredients, and instructions are required.' });
        }

        const recipe = new Recipe({
            name,
            ingredients: ingredients.split(',').map(i => i.trim()),
            instructions,
            nutritionalInfo: { calories, protein, fat, carbs },
            image: req.file ? `/uploads/recipes/${req.file.filename}` : null,
            author: req.user.id, // Set the author as the authenticated user
        });

        await recipe.save();
        res.status(201).json({ message: 'Recipe added successfully', recipe });
    } catch {
        // Removed error handling
    }
});

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find().select('_id name'); // Fetch only ID and name
        res.json(recipes);
    } catch {
        // Removed error handling
    }
});

// Like a recipe
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    recipe.likes += 1;
    await recipe.save();
    res.json({ message: 'Recipe liked', likes: recipe.likes });
  } catch {
    // Removed error handling
  }
});

// Autocomplete endpoint
router.get('/autocomplete', async (req, res) => {
    try {
        const { query, number = 5 } = req.query;
        if (!query) return res.status(400).json({ error: 'Query parameter is required' });

        const response = await axios.get('https://api.spoonacular.com/recipes/autocomplete', {
            params: { query, number, apiKey },
        });

        res.json(response.data);
    } catch {
        // Removed error handling
    }
});

// Get recipe details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
            params: { apiKey },
        });

        res.json(response.data);
    } catch {
        // Removed error handling
    }
});

// Download recipe details
router.get('/:id/download', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name');
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const recipeDetails = `Recipe Name: ${recipe.name}\nAuthor: ${recipe.author.name}\nIngredients: ${recipe.ingredients.join(', ')}\nInstructions: ${recipe.instructions}\nNutritional Info: Calories - ${recipe.nutritionalInfo.calories}, Protein - ${recipe.nutritionalInfo.protein}, Fat - ${recipe.nutritionalInfo.fat}, Carbs - ${recipe.nutritionalInfo.carbs}`;

    res.setHeader('Content-Disposition', `attachment; filename="${recipe.name}.txt"`);
    res.send(recipeDetails);
  } catch {
    // Removed error handling
  }
});

// Search recipes by nutrients using Spoonacular API
router.get('/findByNutrients', async (req, res) => {
    try {
        const apiKey = process.env.SPOONACULAR_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Spoonacular API key is not configured' });
        }

        const queryParams = { ...req.query, apiKey };
        const response = await axios.get('https://api.spoonacular.com/recipes/findByNutrients', { params: queryParams });

        if (response.status !== 200) {
            return res.status(response.status).json({ error: 'Failed to fetch recipes from Spoonacular' });
        }

        res.json(response.data);
    } catch {
        // Removed error handling
    }
});

// Route to fetch recipes by nutrients
router.get('/findByNutrients', async (req, res) => {
  try {
    const { calories, protein, carbs, fat } = req.query;

    const url = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${apiKey}&minCalories=0&maxCalories=${calories}&minProtein=0&maxProtein=${protein}&minCarbs=0&maxCarbs=${carbs}&minFat=0&maxFat=${fat}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch {
    // Removed error handling
  }
});

// Route to fetch recipes by ingredients
router.get('/findByIngredients', async (req, res) => {
  try {
    const { ingredients } = req.query;
    if (!ingredients) return res.status(400).json({ error: 'Ingredients parameter is required' });

    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${ingredients}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch {
    // Removed error handling
  }
});

// Fetch recipe details from Spoonacular API
router.get('/spoonacular/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const apiKey = process.env.SPOONACULAR_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Spoonacular API key is not configured' });
        }

        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
            params: { apiKey },
        });

        if (response.status !== 200) {
            return res.status(response.status).json({ error: 'Failed to fetch recipe details from Spoonacular' });
        }

        res.json(response.data);
    } catch {
        // Removed error handling
    }
});

// Advanced recipe search using Spoonacular API
router.get('/complexSearch', async (req, res) => {
    try {
        const { query, number = 10 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const apiKey = process.env.SPOONACULAR_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Spoonacular API key is not configured' });
        }

        const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: { query, number, apiKey },
        });

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            return res.status(404).json({ error: 'No recipes found for the given query' });
        }

        res.json(response.data.results);
    } catch {
        // Removed error handling
    }
});

// Fetch nutrition widget data for a recipe by ID
router.get('/:id/nutrition', async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Spoonacular API key is not configured' });
    }

    try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/nutritionWidget.json`, {
            params: { apiKey },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching nutrition data:', error.message);
        res.status(500).json({ error: 'Failed to fetch nutrition data' });
    }
});

module.exports = router;