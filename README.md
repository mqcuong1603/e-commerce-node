# Computer Store E-commerce Application

A full-stack e-commerce application for computer components built with Node.js, Express, MongoDB, and React.

## Features

- User authentication (local and social login)
- Product catalog with categories and filtering
- Product reviews and ratings with real-time updates
- Shopping cart functionality
- Checkout process with discount codes
- Admin dashboard for product and order management
- Responsive design for all devices

## Tech Stack

### Backend

- Node.js with Express
- MongoDB for database
- Mongoose as ODM
- JWT for authentication
- Socket.io for real-time features
- Passport.js for social authentication

### Frontend

- React with React Router
- Redux for state management
- Tailwind CSS for styling
- Socket.io client for real-time updates

### DevOps

- Docker for containerization
- Render.com for hosting
- MongoDB Atlas for database hosting

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- MongoDB (if running locally without Docker)

### Local Development with Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/computer-store.git
   cd computer-store
   ```

2. Create environment files:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. Start the application using Docker Compose:

   ```bash
   docker-compose up -d
   ```

4. The application will be available at:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

### Local Development without Docker

#### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables (see `.env.example`)

4. Start the server:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables (see `.env.example`)

4. Start the development server:
   ```bash
   npm start
   ```

## Database Seeding

The application includes a data seeding utility that will populate the database with initial data for testing and development. The seeding runs automatically on first startup when `SEED_DATABASE=true` in the environment.

The seed data includes:

- Admin user (Email: admin@example.com, Password: Admin123!)
- Categories and subcategories for computer components
- Sample products with variants, images, and specifications
- Sample reviews and ratings

## Project Structure

```
project-root/
├── server/                # Backend code
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API endpoints
│   ├── config/            # Configuration
│   ├── utils/             # Utility functions
│   ├── data/              # Seed data
│   └── app.js             # Main application file
├── client/                # Frontend code
│   ├── public/            # Static files
│   └── src/               # React components and logic
├── docker/                # Docker configuration
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── nginx.conf
├── docker-compose.yml     # Docker Compose configuration
└── render.yaml            # Render.com configuration
```

## Deployment

This project is configured for easy deployment to Render.com using Docker. See the [Render Deployment Guide](RENDER_DEPLOYMENT.md) for detailed instructions.

## Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project was developed as part of the Web Programming with Node.js course.
- Design inspiration from various e-commerce platforms.
