# Recipe Sharing Platform

This repository contains a full-stack Recipe Sharing Platform built with the MERN stack.

## Features
- JWT-based authentication
- User registration and login
- Recipe creation, viewing, and updating
- Recipe ownership authorization
- External image lookup using TheMealDB API
- Responsive React frontend with Bootstrap styling
- Dark mode support and recipe preview images on the homepage

## Setup

### Backend
1. Navigate to `backend`
2. Copy `.env.example` to `.env`
3. Set `MONGO_URI`, `JWT_SECRET`, and `PORT`
4. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend
1. Navigate to `client`
2. Install dependencies:
   ```bash
   cd client
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Optional root startup
From the repository root, install the root dev dependency once and start both servers with:
```bash
npm install
npm run dev
```

## API Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive a JWT
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get a recipe by id
- `POST /api/recipes` - Create a recipe (requires auth)
- `PUT /api/recipes/:id` - Update a recipe if you are the owner

## Notes
- The frontend uses `VITE_API_URL` to connect to the backend.
- The recipe details page fetches an image from TheMealDB using the recipe title.
- If image lookup fails, a default placeholder image is shown.
