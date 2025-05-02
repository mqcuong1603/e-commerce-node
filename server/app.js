import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

// Import route files
import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
// import orderRoutes from "./routes/order.routes.js";
// import reviewRoutes from "./routes/review.routes.js";
// import discountRoutes from "./routes/discount.routes.js";
// import adminRoutes from "./routes/admin.routes.js";

// Import middleware and configurations
import { errorHandler } from "./middleware/response.middleware.js";
import {
  configureMiddleware,
  configureErrorHandlers,
} from "./middleware/config.middleware.js";
import { configureSocketIO } from "./middleware/socket.middleware.js";
import {
  connectDatabase,
  getDatabaseStatus,
  closeDatabase,
} from "./config/database.config.js";

// Import passport configuration
import "./config/passport.config.js";

// Import database seeding function and verification
import seedDatabase from "./utils/seedData.js";
import verifySetup from "./utils/verifySetup.js";

// Configure dotenv
dotenv.config();

// Create a config object for centralized configuration
const config = {
  port: process.env.PORT || 3000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  dbUri:
    process.env.MONGODB_URI ||
    "mongodb://admin:password123@mongo:27017/ecommerce?authSource=admin",
  sessionSecret: process.env.SESSION_SECRET || "your-secret-key",
  nodeEnv: process.env.NODE_ENV || "development",
};

// Set up simple structured logging
const logger = {
  info: (message) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
  error: (message, error) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error),
};

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Configure all middleware from the separate file
configureMiddleware(app, config, logger);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Configure Socket.io
configureSocketIO(io, logger);

// Register all API routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/discounts", discountRoutes);
// app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);

// Enhanced Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: dbStatus,
  });
});

// Configure error handlers from the separate file
configureErrorHandlers(app, errorHandler);

// Initialize the application
const initializeApp = async () => {
  try {
    // Connect to database
    await connectDatabase(config, logger, seedDatabase, verifySetup);

    // Start the server
    const server = httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown handlers
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(async () => {
        logger.info("HTTP server closed");
        await closeDatabase(logger);
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT signal received: closing HTTP server");
      server.close(async () => {
        logger.info("HTTP server closed");
        await closeDatabase(logger);
        process.exit(0);
      });
    });

    // Unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise);
      logger.error("Reason:", reason);
      // Application continues running but logs the error
    });

    return server;
  } catch (error) {
    logger.error("Failed to initialize application", error);
    process.exit(1);
  }
};

// Initialize the app if this file is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeApp();
}
8;
// For testing purposes
export default app;
