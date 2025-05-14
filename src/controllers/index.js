const axios = require('axios'); // Import axios for API requests

class IndexController {
    getRecipes(req, res) {
        // Logic to retrieve recipes
        res.send("List of recipes");
    }

    addRecipe(req, res) {
        // Logic to add a new recipe
        res.send("Recipe added");
    }

    async getPopularRecipes(req, res) {
        try {
            const apiKey = 'YOUR_SPOONACULAR_API_KEY'; // Replace with your Spoonacular API key
            const response = await axios.get(`https://api.spoonacular.com/recipes/random`, {
                params: {
                    number: 10, // Number of recipes to fetch
                    apiKey: apiKey,
                },
            });

            const recipes = response.data.recipes;
            res.json({
                success: true,
                data: recipes,
            });
        } catch {
            // Removed error handling
        }
    }

    async autocompleteRecipes(req, res) {
        try {
            const { query, number } = req.query;
            if (!query) {
                return res.status(400).json({ error: 'Query parameter is required' });
            }

            const apiKey = process.env.SPOONACULAR_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: 'Spoonacular API key is not configured' });
            }

            const response = await axios.get(`https://api.spoonacular.com/recipes/autocomplete`, {
                params: {
                    query,
                    number: number || 5,
                    apiKey,
                },
            });

            if (response.data.length === 0) {
                return res.status(404).json({ error: 'No autocomplete suggestions found' });
            }

            res.json(response.data);
        } catch {
            // Removed error handling
        }
    }
}

const authController = require('./authController');

module.exports = {
    authController,
    indexController: new IndexController(), // Export the updated controller
    // ...other controllers
};