const express = require('express');
const router = express.Router();
const {registerUser, loginUser, grtProfile, logoutUser} = require('../controllers/userController');
import auth from "../middleware/authMiddleware";

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);

router.get('/profile', auth, getProfile);

module.exports = router;

