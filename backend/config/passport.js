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
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        return done(null, user);
      }

      // If not, create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: 'google-auth', // Set a placeholder password
        img: profile.photos[0].value,
        google: {
          id: profile.id,
          token: accessToken
        }
      });

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

module.exports = passport;