const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const db = require("./database.js"); // Adjust the path as necessary
// Ensure the database is connected
db.connect()
  .then(() => {
    const User = db.getUserModel(); // Get the User model after connection is established

    const facebookStrategy = new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["id", "emails", "name"], // IMPORTANT: request email and name
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ facebookId: profile.id });
          let email = profile.emails?.[0]?.value;

          // If no email is returned, generate a dummy email
          if (!email) {
            email = `facebookuser_${profile.id}@whiskerway.com`;
          }

          if (!user) {
            user = await new User({
              facebookId: profile.id,
              email: email,
              firstName: profile.name?.givenName || "FacebookUser",
              lastName: profile.name?.familyName || "User",
            }).save();
          }

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    );

    // Use the Facebook Strategy
    passport.use(facebookStrategy);
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  });
