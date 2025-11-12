// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_CALLBACK = (() => {
  if (process.env.GOOGLE_CALLBACK_URL) {
    return process.env.GOOGLE_CALLBACK_URL;
  }
  return 'http://localhost:5000/api/auth/google/callback';
})();

const FRONTEND_REDIRECT = (() => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  return 'http://localhost:5173';
})();

console.log('=== GOOGLE OAUTH CONFIG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Callback URL:', GOOGLE_CALLBACK);
console.log('Frontend URL:', FRONTEND_REDIRECT);
console.log('==========================');

// NO serialization/deserialization needed for JWT

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('✓ Google OAuth Success - Profile received:', profile.emails[0].value);
        
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          console.log('✓ Existing user found:', user.email);
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          googleId: profile.id,
          username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now(),
          email: profile.emails[0].value,
          profilePic: profile.photos[0]?.value || '',
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
          collections: [],
          favorites: [],
          stats: {
            totalSnippets: 0,
            publicSnippets: 0,
            privateSnippets: 0
          }
        });

        console.log('✓ New user created:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('✗ Error in Google OAuth callback:', error);
        return done(error, null);
      }
    }
  )
);

export { FRONTEND_REDIRECT };
export default passport;