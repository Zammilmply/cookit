document.addEventListener('DOMContentLoaded', () => {
  // Add event listener for "View Recipe" buttons
  document.getElementById('personal-recipes-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('view-recipe')) {
      const recipeId = e.target.getAttribute('data-id');
      const recipeType = e.target.getAttribute('data-type');

      if (recipeType === 'user') {
        window.location.href = `user-added-recipe.html?id=${recipeId}`;
      }
    }
  });
});