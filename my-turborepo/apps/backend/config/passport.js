import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Simplified - just use env variable with fallback
const GOOGLE_CALLBACK = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
          email: profile.emails[0].value,
          profilePic: profile.photos[0]?.value || '',
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // More secure random password
          collections: [],
          favorites: [],
          stats: {
            totalSnippets: 0,
            publicSnippets: 0,
            privateSnippets: 0
          }
        });

        return done(null, user);
      } catch (error) {
        console.error("Error in Google OAuth:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;