import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User exists" });

    const user = await User.create({ username, email, password });

    res.cookie("token", generateToken(user._id), {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ _id: user._id, username: user.username, email: user.email });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.cookie("token", generateToken(user._id), {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ _id: user._id, username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  res.cookie("token", "", { 
    httpOnly: true,       // cookie not accessible via client-side JS
    expires: new Date(0), // expires immediately
    sameSite: "lax",      // optional: helps with CORS
    secure: process.env.NODE_ENV === "production" // only send over HTTPS in prod
  });

  res.json({ message: "Logged out successfully" });
};


export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("snippets");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
