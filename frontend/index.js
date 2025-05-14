document.addEventListener('DOMContentLoaded', () => {
  // Initialize the application
  initializeApp();

  // Add event listener for "View Recipe" buttons
  document.getElementById('recipe-suggestions').addEventListener('click', (e) => {
    if (e.target.classList.contains('view-recipe')) {
      const recipeId = e.target.getAttribute('data-id');
      window.location.href = `recipe-details.html?id=${recipeId}`;
    }
  });

  // Function to handle viewing a random recipe
  document.getElementById('view-random-recipe-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:5000/api/recipes/random');
        if (!response.ok) throw new Error('Failed to fetch random recipe');

        const recipe = await response.json();
        window.location.href = `recipe-details.html?id=${recipe._id}`;
    } catch (error) {
        console.error('Error fetching random recipe:', error.message);
        alert('Failed to load random recipe. Please try again.');
    }
  });

  // Additional initialization logic
  setupEventListeners();
  loadInitialData();
});