import express from "express";
const router = express.Router();
import {register, login, logout, getMe, updateProfile, deleteAccount, changePassword} from "../controllers/authController.js";
import {protect} from "../middleware/authMiddleware.js";
import upload, { handleMulterError } from '../middleware/upload.js';

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


export default router;