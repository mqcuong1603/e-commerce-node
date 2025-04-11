// controllers/auth.controller.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import { ApiError } from "../middleware/response.middleware.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { email, fullName, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new ApiError("User with this email already exists", 400);
    }

    // Create user
    const user = new User({
      email,
      fullName,
      passwordHash: password, // Will be hashed in pre-save hook
    });

    await user.save();

    // Transfer cart if one exists with the session ID
    if (req.session.id) {
      const sessionCart = await Cart.findOne({ sessionId: req.session.id });
      if (sessionCart) {
        await sessionCart.transferCart(user._id);
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data without sensitive info
    return res.success({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Check password
    const isMatch = await user.verifyPassword(password);

    if (!isMatch) {
      throw new ApiError("Invalid email or password", 401);
    }

    // Check if user is active
    if (user.status !== "active") {
      throw new ApiError("Your account is inactive or banned", 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Transfer session cart to user if exists
    if (req.session.id) {
      const sessionCart = await Cart.findOne({ sessionId: req.session.id });
      if (sessionCart) {
        await sessionCart.transferCart(user._id);
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data without sensitive info
    return res.success({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-passwordHash -passwordSalt"
    );
    return res.success(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Social auth callback handler
 */
export const socialAuthCallback = async (req, res, next) => {
  try {
    // User will be attached by passport strategy
    const user = req.user;

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Transfer cart if one exists with the session ID
    if (req.session.id) {
      const sessionCart = await Cart.findOne({ sessionId: req.session.id });
      if (sessionCart) {
        await sessionCart.transferCart(user._id);
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // For API response, return the token
    if (req.get("Accept") === "application/json") {
      return res.success({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        token,
      });
    }

    // For browser redirects, redirect with token in URL
    // The frontend can extract this token from URL and store in localStorage
    const frontendURL = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};
