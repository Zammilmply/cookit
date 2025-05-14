// Add event listener to the admin login form
// Prevents default form submission and handles login logic
document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  const errorMessage = document.getElementById('error-message');

  try {
    // Fetch API call to authenticate admin login
    // Sends email and password to the server and handles the response
    const response = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store the received token in localStorage and redirect to the admin dashboard
    localStorage.setItem('token', data.token); // Store the token
    window.location.href = data.redirect; // Redirect to admin dashboard
  } catch (error) {
    // Display error message if login fails
    errorMessage.textContent = error.message;
    errorMessage.classList.remove('d-none');
  }
});
