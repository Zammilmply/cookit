// Centralized API_BASE_URL definition
const API_BASE_URL = 'http://localhost:5000/api';

// Export API_BASE_URL for use in other scripts
export { API_BASE_URL };

// Add a global loading spinner for API calls
const globalSpinner = document.createElement('div');
globalSpinner.id = 'global-loading-spinner';
globalSpinner.style.display = 'none';
globalSpinner.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
document.body.appendChild(globalSpinner);

function showGlobalSpinner() {
    globalSpinner.style.display = 'flex';
}

function hideGlobalSpinner() {
    globalSpinner.style.display = 'none';
}

// Enhanced error handling for non-JSON responses
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        ...options.headers
    };

    try {
        const response = await fetch(endpoint, { ...options, headers });
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            const errorDetails = {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            };

            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                console.error('API Error Details:', { ...errorDetails, errorData });
                throw new Error(errorData.error || 'An unexpected error occurred.');
            } else {
                console.error('API Error Details:', errorDetails);
                throw new Error('Unexpected response from server. Please check the API endpoint.');
            }
        }

        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            console.error('Unexpected response format:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });
            throw new Error('Unexpected response format. Expected JSON.');
        }
    } catch (error) {
        console.error(`API Request Error: ${error.message}`, {
            endpoint,
            options,
            headers
        });
        throw error;
    }
}

// Wrap API calls with spinner visibility
async function apiRequestWithSpinner(endpoint, options = {}) {
    try {
        showGlobalSpinner();
        return await apiRequest(endpoint, options);
    } catch (error) {
        throw error;
    } finally {
        hideGlobalSpinner();
    }
}

// Add comments to explain complex logic
// This function handles role-based redirection based on the user's role stored in localStorage
function handleRoleRedirection() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    const userRole = localStorage.getItem('role');
    if (userRole === 'admin' && !window.location.pathname.includes('admin-dashboard.html')) {
        window.location.href = 'admin-dashboard.html';
    } else if (userRole === 'user' && window.location.pathname.includes('admin-dashboard.html')) {
        window.location.href = 'user-dashboard.html';
    }
}

// Initialize role-based redirection on page load
document.addEventListener('DOMContentLoaded', handleRoleRedirection);

// Add a global error handler to log client-side errors
window.addEventListener('error', (event) => {
    console.error('Client-side error:', event.message, 'at', event.filename, 'line:', event.lineno, 'column:', event.colno);
});

// Add a handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to Cookit!');
    const AUTH_API_BASE_URL = 'http://localhost:5000/api/auth';
    const API_KEY = 'e56699063aea49b7a2412c77e0874d92';

    const userRole = localStorage.getItem('role');

    // Adjust navigation links
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        adminLink.style.display = userRole === 'admin' ? 'block' : 'none';
    }

    // Password toggle functionality
    function setupPasswordToggle(toggleId, inputId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);

        if (toggle && input) {
            toggle.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    toggle.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        }
    }

    setupPasswordToggle('toggleRegisterPassword', 'register-password');
    setupPasswordToggle('toggleConfirmPassword', 'register-confirm-password');
    setupPasswordToggle('toggleLoginPassword', 'login-password');

    // Authentication Functions
    function initializeAuth() {
        // Password strength checker
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            const strengthBar = document.getElementById('password-strength-bar');
            const passwordHints = {
                length: document.getElementById('length-hint'),
                uppercase: document.getElementById('uppercase-hint'),
                number: document.getElementById('number-hint'),
                special: document.getElementById('special-hint')
            };

            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                let strength = 0;
                
                // Check password requirements
                const hasLength = password.length >= 8;
                const hasUppercase = /[A-Z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                
                // Update hint classes
                if (passwordHints.length) passwordHints.length.classList.toggle('valid', hasLength);
                if (passwordHints.uppercase) passwordHints.uppercase.classList.toggle('valid', hasUppercase);
                if (passwordHints.number) passwordHints.number.classList.toggle('valid', hasNumber);
                if (passwordHints.special) passwordHints.special.classList.toggle('valid', hasSpecial);
                
                // Calculate strength
                if (hasLength) strength += 25;
                if (hasUppercase) strength += 25;
                if (hasNumber) strength += 25;
                if (hasSpecial) strength += 25;
                
                // Update strength bar
                if (strengthBar) {
                    strengthBar.style.width = `${strength}%`;
                    strengthBar.style.backgroundColor = 
                        strength < 50 ? '#ff4757' : 
                        strength < 75 ? '#ffa502' : '#2ed573';
                }
            });
        }

        // Password match checker
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        const passwordMatchFeedback = document.getElementById('password-match-feedback');
        
        if (confirmPasswordInput && passwordMatchFeedback) {
            confirmPasswordInput.addEventListener('input', () => {
                const password = document.getElementById('register-password')?.value || '';
                const confirmPassword = confirmPasswordInput.value;
                
                if (confirmPassword && password !== confirmPassword) {
                    passwordMatchFeedback.textContent = 'Passwords do not match';
                } else {
                    passwordMatchFeedback.textContent = '';
                }
            });
        }

        // Switch between login and register forms
        document.getElementById('show-register').addEventListener('click', () => {
            document.getElementById('login').classList.remove('show', 'active');
            document.getElementById('register').classList.add('show', 'active');
            document.getElementById('login-tab').classList.remove('active');
            document.getElementById('register-tab').addClass('active');
        });

        document.getElementById('show-login').addEventListener('click', () => {
            document.getElementById('register').classList.remove('show', 'active');
            document.getElementById('login').classList.add('show', 'active');
            document.getElementById('register-tab').classList.remove('active');
            document.getElementById('login-tab').addClass('active');
        });
    }

    // Recipe Functions
    async function fetchRecipeDetails(recipeId) {
        const recipeUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=true`;
        try {
            const response = await fetch(recipeUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch recipe details');
            }
            const recipe = await response.json();

            const ingredientList = document.getElementById("ingredient-container");
            if (ingredientList) {
                if (recipe.extendedIngredients) {
                    ingredientList.innerHTML = recipe.extendedIngredients.map(ing => `
                        <li>${ing.original}</li>
                    `).join("");
                } else {
                    console.error("No ingredient data found!");
                    ingredientList.innerHTML = "<p>No ingredients available.</p>";
                }
            } else {
                console.warn("Element 'ingredient-container' not found!");
            }

            // Display other recipe details
            const recipeTitle = document.getElementById("recipe-title");
            if (recipeTitle) recipeTitle.textContent = recipe.title;

            const recipeImage = document.getElementById("recipe-image");
            if (recipeImage) recipeImage.src = recipe.image || "https://via.placeholder.com/600x400";

            const recipeInstructions = document.getElementById("recipe-instructions");
            if (recipeInstructions) {
                recipeInstructions.innerHTML = recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0
                    ? recipe.analyzedInstructions[0].steps.map(step => `<p>${step.number}. ${step.step}</p>`).join("")
                    : "<p>No instructions available.</p>";
            }
        } catch (error) {
            console.error("Error fetching recipe details:", error);
        }
    }

    async function loadPersonalRecipes() {
        try {
            const response = await fetch(`${API_BASE_URL}/user/recipes`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            const personalRecipes = await response.json();
            const personalRecipesList = document.getElementById('personal-recipes-list');
            personalRecipesList.innerHTML = '';

            personalRecipes.forEach(recipe => {
                const div = document.createElement('div');
                div.className = 'col-md-4 mb-4';
                div.innerHTML = `
                    <div class="card h-100">
                        <img src="${recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                             class="card-img-top" 
                             alt="${recipe.title}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${recipe.title}</h5>
                            <div class="mt-auto">
                                <a href="recipe-details.html?id=${recipe.id}" class="btn btn-primary btn-sm mr-2">
                                    <i class="fas fa-eye"></i> View Recipe
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                personalRecipesList.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading personal recipes:', error);
        }
    }

    async function loadRecipes() {
        try {
            const response = await fetch(`${API_BASE_URL}/recipes`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const recipes = await response.json();
            const recipeList = document.getElementById('recipe-list'); // Ensure this element exists in your HTML

            recipeList.innerHTML = ''; // Clear existing content
            recipes.forEach(recipe => {
                const listItem = document.createElement('li');
                listItem.textContent = `${recipe.name} (ID: ${recipe._id})`;
                recipeList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error loading recipes:', error.message);
        }
    }

    // Call the function when the page loads
    document.addEventListener('DOMContentLoaded', loadRecipes);

    // Load recipe details if on recipe page
    if (window.location.pathname.includes('recipe-details.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('recipeId');
        if (recipeId) {
            fetchRecipeDetails(recipeId);
        }
    }

    // Initialize all functionality
    document.addEventListener('DOMContentLoaded', () => {
        initializeAuth();
    });

    // Check authentication state on page load
    function checkAuthState() {
        const token = localStorage.getItem('token');
        const authLinks = document.querySelectorAll('.auth-link');
        const profileLinks = document.querySelectorAll('.profile-link');
        
        if (token) {
            authLinks.forEach(link => link.style.display = 'none');
            profileLinks.forEach(link => link.style.display = 'block');
        } else {
            authLinks.forEach(link => link.style.display = 'block');
            profileLinks.forEach(link => link.style.display = 'none');
        }
    }

    checkAuthState();

    // Logout functionality
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = 'index.html';
        });
    });

    // Logout functionality
    function logout() {
        localStorage.removeItem('token'); // Clear the authentication token
        localStorage.removeItem('role'); // Clear the user role if stored
        window.location.href = 'index.html'; // Redirect to the homepage
    }

    // Attach logout function to logout button
    document.getElementById('logout-btn')?.addEventListener('click', logout);
});

// Handle form submissions for login and registration
function initializeAuthForms() {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, name, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    window.location.href = 'auth.html';
                }
            } catch (error) {
                console.error('Registration error:', error);
            }
        });
    }
}

// Redirect to admin dashboard if logged in as admin
const handleLoginRedirect = (response) => {
    if (response.redirect) {
        window.location.href = response.redirect;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');

            if (!emailInput || !passwordInput) {
                console.error('Login form elements not found in the DOM.');
                return;
            }

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    handleLoginRedirect(data);
                }
            } catch (error) {
                console.error('Login error:', error);
            }
        });
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = data.redirect;
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('register-password').value;

    // Removed password validation logic
    // ...existing code for form submission...
});

function validatePassword(password) {
    return password.length >= 8;
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
    }
}

function checkAuthAndRole() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const userRole = payload.role;

    if (window.location.pathname.includes('admin-dashboard.html') && userRole !== 'admin') {
        window.location.href = 'user-dashboard.html';
    } else if (window.location.pathname.includes('user-dashboard.html') && userRole !== 'user') {
        window.location.href = 'admin-dashboard.html';
    }
}

// Call this function on protected pages
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-dashboard.html') || window.location.pathname.includes('user-dashboard.html')) {
        checkAuthAndRole();
    }
});

// Call this function on protected pages
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('user-dashboard.html') || window.location.pathname.includes('admin-dashboard.html')) {
        checkAuth();
    }
});