// app.js - Main application entry point (ES Modules version)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import session from "express-session";
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

// Import middleware
import {
  responseMiddleware,
  errorHandler,
} from "./middleware/response.middleware.js";
import {
  authMiddleware,
  adminMiddleware,
} from "./middleware/auth.middleware.js";

// Import passport configuration
import "./config/passport.config.js";

// Configure dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Configure middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(responseMiddleware);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true, // Changed to true to create session IDs for guests
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Import database seeding function and verification
import seedDatabase from "./utils/seedData.js";
import verifySetup from "./utils/verifySetup.js";

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce")
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Seed database with initial data if needed
    await seedDatabase();

    // Verify the setup is working correctly
    setTimeout(async () => {
      await verifySetup();
    }, 2000); // Wait 2 seconds to ensure seeding is complete
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// API routes
app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/discounts", discountRoutes);
// app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Socket.io setup for real-time features
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle product reviews in real-time
  socket.on("new_review", (data) => {
    socket.broadcast.emit("review_update", data);
  });

  // Handle real-time cart updates
  socket.on("cart_update", (data) => {
    socket.broadcast.emit("cart_changed", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// For testing purposes
export default app;
