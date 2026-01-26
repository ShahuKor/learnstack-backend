import express from "express";
import {
  createUserAccount,
  authenticateUser,
  logoutUser,
  getCurrentUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";
import { validateSignup } from "../middleware/validation.middleware.js";

const router = express.Router();

//auth routes
router.post("/signup", validateSignup, createUserAccount);
router.get("/login", authenticateUser);
router.get("/logout", logoutUser);

//profile routes
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch(
  "/profile",
  isAuthenticated,
  upload.single("avatar"),
  updateUserProfile,
);
export default router;
