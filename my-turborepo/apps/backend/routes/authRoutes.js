import express from "express";
const router = express.Router();
import {register, login, logout, getMe, updateProfile, deleteAccount, changePassword, googleAuth, googleAuthCallback} from "../controllers/authController.js";
import {protect} from "../middleware/authMiddleware.js";
import upload, { handleMulterError } from '../middleware/upload.js';
import passport from "../config/passport.js";

router.post("/register", register);

router.post("/login", login);

router.post("/logout", protect, logout);

router.get("/me", protect, getMe);

router.put(
  '/profile', 
  protect, 
  upload.single('profilePic'), 
  handleMulterError,  // Add this error handler
  updateProfile
); // ← Added upload.single()

router.put('/change-password', protect, changePassword);

router.delete('/account', protect, deleteAccount);

router.get('/google', googleAuth);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleAuthCallback
);


export default router;