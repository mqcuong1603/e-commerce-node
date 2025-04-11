# E-commerce Computer Components Store

## Project Overview

This is an e-commerce web application for selling computer components. It features a responsive design, user authentication, product catalog, shopping cart, and order management system.

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose installed on your machine
- Git (to clone the repository)

## Quick Start

### Running with Docker (Recommended)

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Start the application using Docker Compose:

   ```bash
   docker-compose up -d
   ```

3. The application will be available at:

   - Backend API: http://localhost:3000
   - Frontend (if implemented): http://localhost:8080

4. To stop the application:
   ```bash
   docker-compose down
   ```

### Demo Accounts

The application is pre-seeded with the following accounts:

- **Admin User**
  - Email: admin@example.com
  - Password: Admin123!

### Automatic Database Seeding

When the application starts for the first time, it automatically populates the database with:

- Categories and subcategories for computer components
- Sample products with variants and images
- Admin user account

## API Documentation

### Products API

- `GET /api/products/landing` - Get products for the landing page (new, bestsellers, and by category)
- `GET /api/products` - Get all products with pagination, filtering, and sorting
- `GET /api/products/:slug` - Get product details by slug
- `GET /api/products/category/:slug` - Get products by category

### Categories API

- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree hierarchy
- `GET /api/categories/menu` - Get categories for navigation menu
- `GET /api/categories/:slug` - Get category by slug

### Cart API

- `GET /api/cart` - Get current cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:productVariantId` - Update cart item quantity
- `DELETE /api/cart/items/:productVariantId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Authentication API

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get user profile (authenticated users only)
- `GET /api/auth/google` - Login with Google
- `GET /api/auth/facebook` - Login with Facebook

### Orders API

- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders for current user
- `GET /api/orders/:id` - Get order details by ID
- `GET /api/orders/history` - Get order history for current user

## Project Structure

```
project-root/
├── config/               # Configuration files
├── controllers/          # Controller logic
├── middleware/           # Middleware functions
├── models/               # Mongoose models
├── routes/               # API routes
├── utils/                # Utility functions
├── public/               # Static files
├── docker/               # Docker configuration
├── app.js                # Main application file
├── package.json          # Project dependencies
└── docker-compose.yml    # Docker Compose configuration
```

## Technologies Used

### Backend

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens (JWT)
- Bcrypt.js (for password hashing)
- Socket.IO (for real-time features)
- Passport.js (for social auth)

### DevOps

- Docker & Docker Compose
- Environment variables management
- MongoDB container with persistent storage

## Features Implemented

1. **User Authentication**

   - Email/password registration and login
   - Social media authentication (Google, Facebook)
   - JWT-based authentication
   - Password hashing and security

2. **Product Catalog**

   - Products organized by categories
   - Product filtering and search
   - Product variants (e.g., different configurations)
   - Product images

3. **Shopping Cart**

   - Add/remove items
   - Update quantities
   - Cart persistence for both guests and logged-in users

4. **Orders**

   - Order creation
   - Order history
   - Order status tracking

5. **Landing Page**
   - Displaying new products
   - Best sellers section
   - Products by category

## How to Test the Application

### Using the Test Script (Recommended)

We've included a simple test script that automatically checks all the main API endpoints:

```bash
# First, install the required dependency
npm install node-fetch

# Then run the test script
node test-api.js
```

The script will test:

- Server health check
- Authentication with the admin account
- Products API (landing page)
- Categories API
- Cart functionality

The test results will show which parts of the API are working correctly.

### Manual Testing

1. **Backend API Testing**

   - Use tools like Postman or curl to test the API endpoints
   - Example API request to get landing page products:
     ```bash
     curl http://localhost:3000/api/products/landing
     ```

2. **Authentication Testing**

   - Login with the admin user:
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"Admin123!"}' http://localhost:3000/api/auth/login
     ```
   - Register a new user:
     ```bash
     curl -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","fullName":"Test User","password":"Password123"}' http://localhost:3000/api/auth/register
     ```

3. **Database Exploration**
   - To connect to the MongoDB container and explore the database:
     ```bash
     docker exec -it ecommerce-mongo mongosh
     use ecommerce
     db.products.find()
     db.categories.find()
     db.users.find()
     ```

## Verification Process

When the application starts, it automatically:

1. Connects to MongoDB
2. Seeds the database with initial data if it's empty
3. Runs a verification process that checks:
   - Database connection
   - Presence of admin user
   - Presence of categories and products
   - File structure
   - Environment variables

The verification results are displayed in the console, making it easy to confirm that everything is set up correctly.
