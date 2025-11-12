import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Smart callback URL detection based on environment
const GOOGLE_CALLBACK = (() => {
  // Development environment - use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api/auth/google/callback';
  }
  
  // Production environment - use env variable or fallback to production URL
  return process.env.GOOGLE_CALLBACK_URL || 'https://code-snippet-manager-oowo.vercel.app/api/auth/google/callback';
})();

// Frontend URL based on environment
const FRONTEND_REDIRECT = (() => {
  // Development environment - use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5173';
  }
  
  // Production environment - use env variable or fallback to production URL
  return process.env.FRONTEND_URL || 'https://code-snippet-manager-inky.vercel.app';
})();

console.log('=== GOOGLE OAUTH CONFIG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Callback URL:', GOOGLE_CALLBACK);
console.log('Frontend URL:', FRONTEND_REDIRECT);
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✓' : 'Missing ✗');
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✓' : 'Missing ✗');
console.log('==========================');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK,
      proxy: process.env.NODE_ENV === 'production', // Only true in production
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