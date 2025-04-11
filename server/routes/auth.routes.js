// routes/auth.routes.js
import express from "express";
import passport from "passport";
import {
  register,
  login,
  getProfile,
  socialAuthCallback,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get user profile (protected route)
router.get("/profile", authMiddleware, getProfile);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  socialAuthCallback
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  socialAuthCallback
);

export default router;
