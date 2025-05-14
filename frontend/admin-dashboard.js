// Base URL for API requests
const API_BASE_URL = 'http://localhost:5000/api/admin';
const token = localStorage.getItem('token');

// Function to fetch and display recipes in the admin dashboard
async function loadRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const recipes = await response.json();

        const tableBody = document.getElementById('recipe-table-body');
        tableBody.innerHTML = ''; // Clear existing rows

        recipes.forEach((recipe) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${recipe.name}</td>
                <td>${recipe.author?.name || 'Unknown'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editRecipe('${recipe._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecipe('${recipe._id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading recipes:', error.message);
    }
}

// Function to open the edit modal and populate fields with recipe data
function openEditModal(recipe) {
    document.getElementById('edit-recipe-id').value = recipe._id;
    document.getElementById('edit-recipe-name').value = recipe.name;
    document.getElementById('edit-recipe-ingredients').value = recipe.ingredients.join(', ');
    document.getElementById('edit-recipe-instructions').value = recipe.instructions;

    const editModal = new bootstrap.Modal(document.getElementById('editRecipeModal'));
    editModal.show();
}

// Function to save changes to a recipe
async function saveRecipeChanges() {
    const recipeId = document.getElementById('edit-recipe-id').value;
    const updatedRecipe = {
        name: document.getElementById('edit-recipe-name').value,
        ingredients: document.getElementById('edit-recipe-ingredients').value.split(',').map(ing => ing.trim()),
        instructions: document.getElementById('edit-recipe-instructions').value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedRecipe),
        });

        if (!response.ok) throw new Error('Failed to update recipe');

        alert('Recipe updated successfully!');
        loadRecipes(); // Reload recipes
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editRecipeModal'));
        editModal.hide();
    } catch (error) {
        console.error('Error updating recipe:', error.message);
alert('Failed to update recipe. Please try again.');
    }
}

// Event listener for the save button in the edit modal
document.getElementById('save-recipe-btn').addEventListener('click', saveRecipeChanges);

// Function to edit a recipe by fetching its details
async function editRecipe(recipeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch recipe details');

        const recipe = await response.json();
        openEditModal(recipe);
    } catch (error) {
        console.error('Error fetching recipe details:', error.message);
    }
}

// Function to delete a recipe
async function deleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to delete recipe');

        alert('Recipe deleted successfully!');
        loadRecipes(); // Reload recipes
    } catch (error) {
        console.error('Error deleting recipe:', error.message);
    }
}

// Function to fetch and display recent activity in the admin dashboard
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_BASE_URL}/recent-activity`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const activities = await response.json();

        const activityList = document.getElementById('recent-activity');
        activityList.innerHTML = ''; // Clear existing content

        activities.forEach((activity) => {
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item';
            listItem.innerHTML = `
                <p><strong>${activity.action}</strong> by ${activity.user.name}</p>
                <small>${new Date(activity.timestamp).toLocaleString()}</small>
            `;
            activityList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading recent activity:', error.message);
    }
}

// Event listener to load recipes and recent activity on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    loadRecentActivity();
});
