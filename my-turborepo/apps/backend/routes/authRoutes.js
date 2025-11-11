import express from "express";
const router = express.Router();
import {
  register, 
  login, 
  logout, 
  getMe, 
  updateProfile, 
  deleteAccount, 
  changePassword, 
  googleAuth, 
  googleAuthCallback
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload, { handleMulterError } from '../middleware/upload.js';
import passport from "../config/passport.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put('/profile', protect, upload.single('profilePic'), handleMulterError, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

// Google OAuth routes
router.get('/google', googleAuth);
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
  }),
  googleAuthCallback
);

export default router;