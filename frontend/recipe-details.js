// Event listener for DOM content loaded
// Initializes the recipe details page by fetching data from the API
document.addEventListener('DOMContentLoaded', async function() {
  // Extract recipe ID from the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');
  const apiKey = '71370700be9645859d423d9b1c04d1f7'; // Spoonacular API key

  if (recipeId) {
    // Construct API URLs for fetching recipe details, price breakdown, and summary
    const recipeUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=true`;
    const priceBreakdownUrl = `https://api.spoonacular.com/recipes/${recipeId}/priceBreakdownWidget.json?apiKey=${apiKey}`;
    const summaryUrl = `https://api.spoonacular.com/recipes/${recipeId}/summary?apiKey=${apiKey}`;

    try {
      // Fetch recipe details from the API
      const recipeResponse = await fetch(recipeUrl);
      if (!recipeResponse.ok) throw new Error('Failed to fetch recipe details');

      const recipe = await recipeResponse.json();
      console.log('API Response:', recipe); // Debugging API response structure

      // Map API response to DOM elements
      if (recipe.title) {
        document.getElementById('recipe-title').textContent = recipe.title;
      } else {
        console.warn('Title not found in API response');
      }

      if (recipe.image) {
        document.getElementById('recipe-image').src = recipe.image;
      } else {
        console.warn('Image not found in API response');
      }

      if (recipe.extendedIngredients) {
        displayIngredients(recipe.extendedIngredients);
      } else {
        console.warn('Ingredients not found in API response');
      }

      if (recipe.analyzedInstructions) {
        displayInstructions(recipe.analyzedInstructions);
      } else {
        console.warn('Instructions not found in API response');
      }

      if (recipe.nutrition?.nutrients) {
        renderNutrientChart(recipe.nutrition.nutrients);
      } else {
        console.warn('Nutritional information not found in API response');
      }

      // Fetch and display price breakdown
      const priceResponse = await fetch(priceBreakdownUrl);
      if (!priceResponse.ok) throw new Error('Failed to fetch price breakdown');
      const priceData = await priceResponse.json();
      displayPriceBreakdown(priceData.ingredients, priceData.totalCost);

      // Fetch and display recipe summary
      const summaryResponse = await fetch(summaryUrl);
      if (!summaryResponse.ok) throw new Error('Failed to fetch recipe summary');
      const summaryData = await summaryResponse.json();
      displayRecipeSummary(summaryData.summary);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      displayMockDetails(); // Display mock data in case of an error
    }

    // Fetch and render nutrient chart
    fetchAndRenderNutrientChart(recipeId);
  }
});

// Function to display recipe details in the DOM
// Updates the title and image of the recipe
function displayRecipeDetails(recipe) {
  document.getElementById('recipe-title').textContent = recipe.title || 'Untitled';
  document.getElementById('recipe-image').src = recipe.image || 'https://via.placeholder.com/300x200';
}

// Function to display ingredients in a list format
// Populates the ingredients list with images and descriptions
function displayIngredients(ingredients) {
  const list = document.getElementById('recipe-ingredients');
  list.innerHTML = ingredients.length
    ? ingredients.map(ing => `
        <li style="display: flex; align-items: center; margin-bottom: 10px;">
          <img src="https://spoonacular.com/cdn/ingredients_100x100/${ing.image}" alt="${ing.name}" style="width: 50px; height: 50px; margin-right: 10px; border-radius: 5px;">
          <span>${ing.original || ing.name}</span>
        </li>
      `).join('')
    : '<li>No ingredients listed.</li>';
}

// Function to display cooking instructions
// Renders the step-by-step instructions for the recipe
function displayInstructions(instructions) {
  const container = document.getElementById('recipe-instructions');
  if (!instructions.length || !instructions[0].steps) {
    container.innerHTML = '<p>No instructions available.</p>';
    return;
  }

  container.innerHTML = instructions[0].steps.map(step => `
    <div style="display: flex; align-items: center; margin-bottom: 20px;">
      <div style="flex: 0 0 40px; height: 40px; background-color: #28a745; color: white; font-weight: bold; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 10px;">
        ${step.number}
      </div>
      <div style="flex: 1;">
        <p>${step.step}</p>
        ${step.ingredients?.length ? `<p><strong>Ingredients:</strong> ${step.ingredients.map(ing => ing.name).join(', ')}</p>` : ''}
        ${step.equipment?.length ? `<p><strong>Equipment:</strong> ${step.equipment.map(eq => eq.name).join(', ')}</p>` : ''}
      </div>
    </div>
  `).join('');
}

// Function to render a nutrient chart using Chart.js
// Visualizes the nutrient content as a line chart
function renderNutrientChart(nutrients) {
  const ctx = document.getElementById('nutrientChart')?.getContext('2d');
  if (!ctx) return;

  const labels = nutrients.map(n => n.name);
  const data = nutrients.map(n => n.percentOfDailyNeeds || 0);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Nutrient Content (% of Daily Needs)',
        data,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Percentage (%)' }
        },
        x: {
          title: { display: true, text: 'Nutrients' }
        }
      }
    }
  });
}

// Function to fetch and render a nutrient chart
// Retrieves nutrient data from the API and renders it
async function fetchAndRenderNutrientChart(recipeId) {
  const apiKey = '71370700be9645859d423d9b1c04d1f7';
  const nutrientUrl = `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${apiKey}`;

  try {
    const response = await fetch(nutrientUrl);
    if (!response.ok) throw new Error('Failed to fetch nutrient data');

    const nutrientData = await response.json();
    renderNutrientChart(nutrientData.nutrients);
  } catch (error) {
    console.error('Error fetching nutrient data:', error);
    displayMockNutrientChart(); // Display mock chart in case of an error
  }
}

// Function to display a mock nutrient chart
// Displays a placeholder chart when nutrient data is unavailable
function displayMockNutrientChart() {
  const ctx = document.getElementById('nutrientChart')?.getContext('2d');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [{
        label: 'Mock Nutrient Content (% of Daily Needs)',
        data: [20, 50, 30],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Percentage (%)' }
        },
        x: {
          title: { display: true, text: 'Nutrients' }
        }
      }
    }
  });
}

// Function to display recipe summary
// Updates the summary section with the recipe's description
function displayRecipeSummary(summary) {
  const recipeSummaryDiv = document.getElementById('recipe-summary');
  recipeSummaryDiv.innerHTML = summary;
}

// Function to display mock details in case of an error
// Populates the page with placeholder data when API calls fail
function displayMockDetails() {
  document.getElementById('recipe-title').textContent = 'Mock Recipe Title';
  document.getElementById('recipe-image').src = 'https://via.placeholder.com/300x200?text=Mock+Image';
  document.getElementById('recipe-ingredients').innerHTML = '<li>Mock Ingredient 1</li><li>Mock Ingredient 2</li>';
  document.getElementById('recipe-instructions').innerHTML = '<p>Mock instructions for the recipe.</p>';
  document.getElementById('recipe-summary').innerHTML = '<p>This is a mock summary for the recipe.</p>';
}

// Function to update nutrition bars with calculated percentages
// Dynamically adjusts the width of nutrition bars based on input values
function updateNutritionBars(protein, carbs, fat) {
  // Validate input values
  const proteinValue = parseFloat(protein) || 0;
  const carbsValue = parseFloat(carbs) || 0;
  const fatValue = parseFloat(fat) || 0;

  // Calculate percentages (for visualization only)
  const proteinPercent = Math.min((proteinValue / 50) * 100, 100); // Assuming 50g is the daily need
  const carbsPercent = Math.min((carbsValue / 300) * 100, 100); // Assuming 300g is the daily need
  const fatPercent = Math.min((fatValue / 70) * 100, 100); // Assuming 70g is the daily need

  // Update bar widths
  document.getElementById('protein-bar').style.width = `${proteinPercent}%`;
  document.getElementById('carbs-bar').style.width = `${carbsPercent}%`;
  document.getElementById('fat-bar').style.width = `${fatPercent}%`;

  // Update bar labels
  document.getElementById('nutrition-protein').textContent = `${proteinValue}g`;
  document.getElementById('nutrition-carbs').textContent = `${carbsValue}g`;
  document.getElementById('nutrition-fat').textContent = `${fatValue}g`;
}
