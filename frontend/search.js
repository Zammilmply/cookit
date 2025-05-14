document.addEventListener('DOMContentLoaded', () => {
    // API Configuration
    const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API URL
    
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const suggestionsList = document.getElementById('suggestions-list');
    const resultsList = document.getElementById('results-list');
    const spinner = document.getElementById('loading-spinner');
    const errorMsg = document.getElementById('error-message');
    
    // Radial Menu Toggle
    const menuButton = document.getElementById('menuButton');
    menuButton.addEventListener('click', () => {
      const menuItems = document.querySelector('.menu-items');
      menuItems.classList.toggle('active');
      menuButton.innerHTML = menuItems.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
  
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-input') && !e.target.closest('#suggestions-list')) {
        suggestionsList.classList.add('hidden');
      }
    });
  
    // Autocomplete with debounce
    let debounceTimer;
    searchInput.addEventListener('input', async (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();
      suggestionsList.innerHTML = '';
  
      if (query.length > 2) {
        debounceTimer = setTimeout(async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/recipes/autocomplete?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
              throw new Error('Failed to fetch suggestions');
            }
            
            const suggestions = await response.json();
            renderSuggestions(suggestions);
          } catch (error) {
            console.error('Autocomplete error:', error);
            showErrorInSuggestions('Could not load suggestions');
          }
        }, 300);
      } else {
        suggestionsList.classList.add('hidden');
      }
    });
  
    function renderSuggestions(suggestions) {
      if (!suggestions || !suggestions.length) {
        showErrorInSuggestions('No suggestions found');
        return;
      }
  
      suggestions.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<i class="fas fa-utensils mr-2"></i> ${item.title}`;
        div.onclick = () => {
          searchInput.value = item.title;
          suggestionsList.classList.add('hidden');
          document.getElementById('search-form').dispatchEvent(new Event('submit'));
        };
        suggestionsList.appendChild(div);
      });
      suggestionsList.classList.remove('hidden');
    }
  
    function showErrorInSuggestions(message) {
      const div = document.createElement('div');
      div.className = 'suggestion-item text-muted';
      div.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i> ${message}`;
      suggestionsList.appendChild(div);
      suggestionsList.classList.remove('hidden');
    }
  
    // Search form handlers
    document.getElementById('search-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = document.getElementById('search-input').value.trim();
      const resultsContainer = document.getElementById('results-list');
      const spinner = document.getElementById('loading-spinner');
      const errorMsg = document.getElementById('error-message');
    
      spinner.classList.remove('hidden');
      resultsContainer.innerHTML = '';
      errorMsg.classList.add('hidden');
    
      try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=9&apiKey=71370700be9645859d423d9b1c04d1f7&addRecipeInformation=true`);
        const data = await response.json();
    
        if (!data.results || !data.results.length) {
          resultsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
              <i class="fas fa-search fa-3x mb-3 text-muted"></i>
              <h4 class="text-muted">No recipes found for "${query}"</h4>
              <p class="text-muted">Try a different search term</p>
            </div>`;
          return;
        }
    
        data.results.forEach(recipe => {
          const recipeCard = document.createElement('div');
          recipeCard.className = 'col-md-4 mb-4';
          recipeCard.innerHTML = `
            <div class="card h-100">
              <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
              <div class="card-body">
                <h5 class="card-title">${recipe.title}</h5>
                <p class="card-text">${recipe.summary.split(' ').slice(0, 20).join(' ')}...</p>
                <a href="recipe-details.html?id=${recipe.id}" class="btn btn-primary">View Recipe</a>
              </div>
            </div>`;
          resultsContainer.appendChild(recipeCard);
        });
      } catch (err) {
        errorMsg.classList.remove('hidden');
        console.error('Search error:', err);
      } finally {
        spinner.classList.add('hidden');
      }
    });
  
    document.getElementById('ingredient-search-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const ingredients = document.getElementById('ingredients').value.trim();
      const resultsContainer = document.getElementById('results-list');
      const spinner = document.getElementById('loading-spinner');
      const errorMsg = document.getElementById('error-message');
    
      spinner.classList.remove('hidden');
      resultsContainer.innerHTML = '';
      errorMsg.classList.add('hidden');
    
      try {
        const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=9&apiKey=71370700be9645859d423d9b1c04d1f7`);
        const data = await response.json();
    
        if (!data || !data.length) {
          resultsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
              <i class="fas fa-search fa-3x mb-3 text-muted"></i>
              <h4 class="text-muted">No recipes found with these ingredients</h4>
              <p class="text-muted">Try different combinations</p>
            </div>`;
          return;
        }
    
        data.forEach(recipe => {
          const recipeCard = document.createElement('div');
          recipeCard.className = 'col-md-4 mb-4';
          recipeCard.innerHTML = `
            <div class="card h-100">
              <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
              <div class="card-body">
                <h5 class="card-title">${recipe.title}</h5>
                <a href="recipe-details.html?id=${recipe.id}" class="btn btn-primary">View Recipe</a>
              </div>
            </div>`;
          resultsContainer.appendChild(recipeCard);
        });
      } catch (err) {
        errorMsg.classList.remove('hidden');
        console.error('Search error:', err);
      } finally {
        spinner.classList.add('hidden');
      }
    });
  
    document.getElementById('nutrient-search-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const maxCalories = document.getElementById('calories').value || 2000;
      const maxProtein = document.getElementById('protein').value || 100;
      const maxCarbs = document.getElementById('carbs').value || 300;
      const maxFat = document.getElementById('fat').value || 100;
      const resultsContainer = document.getElementById('results-list');
      const spinner = document.getElementById('loading-spinner');
      const errorMsg = document.getElementById('error-message');
    
      spinner.classList.remove('hidden');
      resultsContainer.innerHTML = '';
      errorMsg.classList.add('hidden');
    
      try {
        const response = await fetch(`https://api.spoonacular.com/recipes/findByNutrients?maxCalories=${maxCalories}&maxProtein=${maxProtein}&maxCarbs=${maxCarbs}&maxFat=${maxFat}&number=9&apiKey=71370700be9645859d423d9b1c04d1f7`);
        const data = await response.json();
    
        if (!data || !data.length) {
          resultsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
              <i class="fas fa-search fa-3x mb-3 text-muted"></i>
              <h4 class="text-muted">No recipes match your nutritional criteria</h4>
              <p class="text-muted">Try adjusting your values</p>
            </div>`;
          return;
        }
    
        data.forEach(recipe => {
          const recipeCard = document.createElement('div');
          recipeCard.className = 'col-md-4 mb-4';
          recipeCard.innerHTML = `
            <div class="card h-100">
              <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
              <div class="card-body">
                <h5 class="card-title">${recipe.title}</h5>
                <a href="recipe-details.html?id=${recipe.id}" class="btn btn-primary">View Recipe</a>
              </div>
            </div>`;
          resultsContainer.appendChild(recipeCard);
        });
      } catch (err) {
        errorMsg.classList.remove('hidden');
        console.error('Search error:', err);
      } finally {
        spinner.classList.add('hidden');
      }
    });
  
    // Unified search function
    async function performSearch(endpoint, queryParams, emptyMessage) {
      showLoading();
      clearResults();
      hideError();
  
      try {
        const queryString = new URLSearchParams(queryParams).toString();
        const response = await fetch(`${API_BASE_URL}/${endpoint}?${queryString}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Search failed');
        }
  
        const data = await response.json();
        renderResults(data.results || data, emptyMessage);
      } catch (error) {
        showError(error.message || 'An error occurred during search');
        console.error('Search error:', error);
      } finally {
        hideLoading();
      }
    }
  
    // UI Helper Functions
    function showLoading() {
      spinner.classList.remove('hidden');
    }
  
    function hideLoading() {
      spinner.classList.add('hidden');
    }
  
    function showError(message) {
      errorMsg.textContent = message;
      errorMsg.classList.remove('hidden');
    }
  
    function hideError() {
      errorMsg.classList.add('hidden');
    }
  
    function clearResults() {
      resultsList.innerHTML = '';
    }
  
    function renderResults(results, emptyMessage) {
      if (!results || !results.length) {
        resultsList.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="fas fa-search fa-3x mb-3 text-muted"></i>
            <h4 class="text-muted">${emptyMessage}</h4>
          </div>`;
        return;
      }
  
      results.forEach(recipe => {
        const div = document.createElement('div');
        div.className = 'col-md-4 recipe-card';
        div.innerHTML = `
          <div class="card h-100">
            <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${recipe.title}</h5>
              ${recipe.usedIngredientCount ? `
                <div class="mt-2 mb-3">
                  <small class="text-muted">Uses ${recipe.usedIngredientCount} ingredients</small>
                </div>` : ''}
              ${recipe.calories ? `
                <div class="nutrition-info mt-2 mb-3">
                  <span class="badge badge-pill badge-light mr-1">
                    <i class="fas fa-fire text-danger"></i> ${Math.round(recipe.calories)} cal
                  </span>
                  ${recipe.protein ? `
                  <span class="badge badge-pill badge-light mr-1">
                    <i class="fas fa-dumbbell text-primary"></i> ${Math.round(recipe.protein)}g
                  </span>` : ''}
                  ${recipe.carbs ? `
                  <span class="badge badge-pill badge-light mr-1">
                    <i class="fas fa-bread-slice text-warning"></i> ${Math.round(recipe.carbs)}g
                  </span>` : ''}
                  ${recipe.fat ? `
                  <span class="badge badge-pill badge-light">
                    <i class="fas fa-bacon text-info"></i> ${Math.round(recipe.fat)}g
                  </span>` : ''}
                </div>` : ''}
              <button class="btn btn-primary view-recipe mt-auto" data-id="${recipe.id}">
                <i class="fas fa-book-open mr-1"></i> View Recipe
              </button>
            </div>
          </div>`;
        resultsList.appendChild(div);
      });
    }
  
    // View recipe handler
    resultsList.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.view-recipe');
      if (viewBtn) {
        const recipeId = viewBtn.getAttribute('data-id');
        window.location.href = `recipe-details.html?id=${recipeId}`;
      }
    });
  });