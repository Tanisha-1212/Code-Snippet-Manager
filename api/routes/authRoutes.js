import express from "express";
import { registerUser, loginUser, getProfile, logoutUser } from "../controllers/userController.js";
const router = express.Router();
import {auth} from "../middleware/authMiddleware.js";

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', auth,  logoutUser);

router.get('/profile', auth, getProfile);


export default router; 

