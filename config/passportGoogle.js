// =============================================================================
// Google OAuth Strategy
// =============================================================================
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database.js'); // Adjust the path as necessary

// Ensure the database is connected
db.connect()
  .then(() => {
    const User = db.getUserModel(); // Get the User model after connection is established

    // Define the Google Strategy
    const googleStrategy = new GoogleStrategy({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user in your database
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name?.givenName || 'GoogleUser',
            lastName: profile.name?.familyName || '',
          }).save();
        }
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });

    // Use the Google Strategy
    passport.use(googleStrategy);
  })
  .catch(err => {
    console.error("Failed to connect to the database:", err);
  });