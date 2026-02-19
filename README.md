# Car Platform API

Website: https://car-platform-giaf.onrender.com

A modular Node.js/Express backend for managing car listings with built-in car specification lookups via an external API.

## Setup & Installation
1. Clone the repository and run `npm install`.
2. Create a `.env` file and add:
   - `PORT=5090`
   - `MONGO_URI=mongodb_connection_string`
   - `JWT_SECRET=secret_key`
   - `CAR_API_TOKEN=token`
   - `CAR_API_SECRET=secret`
3. Run the server using `npm start`.

## API Documentation

### Authentication (Public)
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Authenticate user & get token.

### User Profile (Private)
- `GET /api/users/profile` - Get current user data.
- `PUT /api/users/profile` - Update user information.

### Cars Resource (Mixed)
- `GET /api/cars` - Get all cars (Public).
- `GET /api/cars/:id` - Get specific car details (Public).
- `POST /api/cars` - Create a new listing (Private).
- `PUT /api/cars/:id` - Update owned listing (Private).
- `DELETE /api/cars/:id` - Delete owned listing (Private).
