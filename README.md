# Cookit

Cookit is a recipe management application that allows users to explore, create, and manage recipes. It includes features for user authentication, recipe search, and admin management.

## Features
- User registration and login
- Recipe search and filtering
- Recipe creation and editing
- Admin dashboard for managing users and recipes
- Responsive design for mobile and desktop

## Prerequisites
- Node.js (v14 or later)
- MongoDB (local or cloud instance)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/cookit.git
   ```
2. Navigate to the project directory:
   ```bash
   cd cookit
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration
1. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SPOONACULAR_API_KEY=your_spoonacular_api_key
   ```

## Running the Server
1. Start the development server:
   ```bash
   npm run dev
   ```
   This will start the server on `http://localhost:5000`.
   The frontent will dispayed n `http://localhost:5000/frontend`.

2. To run the server in production mode:
   ```bash
   npm start
   ```

## Folder Structure
- `frontend/`: Contains the HTML, CSS, and JavaScript files for the client-side application.
- `src/`: Contains the server-side code, including routes, controllers, and models.
- `utils/`: Utility functions and middleware.
- `uploads/`: Directory for storing uploaded recipe images.

## API Endpoints
### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user

### Recipes
- `GET /api/recipes`: Fetch all recipes
- `POST /api/recipes`: Add a new recipe
- `PUT /api/recipes/:id`: Update a recipe
- `DELETE /api/recipes/:id`: Delete a recipe

### Admin
- `GET /api/admin/users`: Fetch all users
- `DELETE /api/admin/users/:id`: Delete a user

## Additional Details
- **Database**: MongoDB is used for storing user and recipe data.
- **Authentication**: JSON Web Tokens (JWT) are used for secure authentication.
- **API Integration**: The Spoonacular API is used for fetching recipe details and nutritional information.
- **Rate Limiting**: Login attempts are rate-limited to prevent brute force attacks.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.#   C o o k i t  
 