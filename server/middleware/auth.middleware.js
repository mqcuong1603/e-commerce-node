// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError } from "./response.middleware.js";

/**
 * Authentication middleware for protected routes
 * Requires valid JWT token in Authorization header
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    let token = req.headers.authorization;

    // Check if token exists
    if (!token || !token.startsWith("Bearer ")) {
      throw new ApiError("Unauthorized - No token provided", 401);
    }

    // Remove "Bearer " from token
    token = token.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select(
      "-passwordHash -passwordSalt"
    );

    if (!user) {
      throw new ApiError("Unauthorized - User not found", 401);
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new ApiError("Account is inactive or banned", 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT specific errors
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError("Unauthorized - Invalid token", 401));
    }

    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Unauthorized - Token expired", 401));
    }

    next(error);
  }
};

/**
 * Admin middleware - requires user to have admin role
 * Must be used after authMiddleware
 */
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    next(new ApiError("Unauthorized - Admin access required", 403));
  }
};

/**
 * Optional auth middleware
 * Doesn't require auth but adds user to req if logged in
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    let token = req.headers.authorization;

    // If no token or invalid format, continue without user
    if (!token || !token.startsWith("Bearer ")) {
      return next();
    }

    // Remove "Bearer " from token
    token = token.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select(
        "-passwordHash -passwordSalt"
      );

      if (user && user.status === "active") {
        // Add user to request object
        req.user = user;
      }
    } catch (err) {
      // Continue without user if token validation fails
    }

    next();
  } catch (error) {
    next();
  }
};
