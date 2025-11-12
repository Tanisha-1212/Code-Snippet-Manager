// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Smart callback URL detection
const GOOGLE_CALLBACK = (() => {
  if (process.env.GOOGLE_CALLBACK_URL) {
    if (process.env.GOOGLE_CALLBACK_URL.includes('localhost') || 
        process.env.GOOGLE_CALLBACK_URL.includes('127.0.0.1')) {
      return process.env.GOOGLE_CALLBACK_URL;
    }
    
    if (process.env.PORT === '5000') {
      return 'http://localhost:5000/api/auth/google/callback';
    }
    
    return process.env.GOOGLE_CALLBACK_URL;
  }
  
  return 'http://localhost:5000/api/auth/google/callback';
})();

const FRONTEND_REDIRECT = process.env.PORT === '5000' 
  ? 'http://localhost:5173' 
  : process.env.FRONTEND_URL;

console.log('=== GOOGLE OAUTH CONFIG ===');
console.log('Callback URL:', GOOGLE_CALLBACK);
console.log('Frontend URL:', FRONTEND_REDIRECT);
console.log('==========================');

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
      .select('-password')
      .populate('snippets', 'title language tags createdAt')
      .populate('collections', 'name color icon')
      .populate('favorites', 'title language tags');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK,
      proxy: true, // CRITICAL for Vercel
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