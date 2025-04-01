import express from "express";
import { json, static as expressStatic } from "express";
import { connect } from "mongoose";
import cors from "cors";
import { join } from "path";
import passport from "passport";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import discountRoutes from "./routes/discount.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Import middleware
import { errorHandler } from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

// Import passport configuration
import "./config/passport.config.js";

// Initialize Express app and HTTP server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(json());
app.use(expressStatic(join(process.cwd(), "public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Database connection
(async () => {
  try {
    await connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
})();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);

// Health check endpoint
app.get("/health", (req, res) =>
  res.status(200).json({ status: "ok", message: "Server is running" })
);

// Socket.io setup
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("new_review", (data) => io.emit("review_update", data));
  socket.on("cart_update", (data) => io.emit("cart_changed", data));

  socket.on("disconnect", () =>
    console.log("🔌 User disconnected:", socket.id)
  );
});

// Error handling
app.use(errorHandler);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Export for testing
export default app;
