const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const passport = require('passport');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Fixed variable name
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        return done(null, user);
      }

      // If user doesn't exist, create a new one
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: 'google-auth',
        img: profile.photos[0].value,
        type: 'traveler',
        country: 'Not Specified',
        mobile: 'Not Specified',
        isAdmin: false
      });

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

module.exports = passport;