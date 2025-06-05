require("dotenv").config();

// =============================================================================
// DEPENDENCIES
// =============================================================================

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const passport = require("passport");
require("./config/passportJwt"); //should be registered before using passport.authenticate() in routes.
require("./config/passportGoogle"); // should be registered before using passport.authenticate() in routes.
require("./config/passportFacebook");
const cookieParser = require("cookie-parser");
const ejsMate = require("ejs-mate");
const cors = require("cors");

// Custom modules
const AppError = require("./AppError");
const db = require("./config/database");
const { optionalJwtMiddleware } = require("./config/passportJwt");

// =============================================================================
// APP CONFIGURATION
// =============================================================================

const app = express();
const port = process.env.PORT || 3000;
const hostname = "localhost";

// View engine setup
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "/views"));
app.use(cors());
// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// Static files and parsing
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Authentication middleware
app.use(passport.initialize());
app.use(cookieParser());
app.use(optionalJwtMiddleware);


//Google API globally available
app.use((req, res, next) => {
  res.locals.GOOGLE_MAPS_API = process.env.GOOGLE_MAPS_API;
  next();
});




// =============================================================================
// DATABASE CONNECTION & ROUTE SETUP
// =============================================================================

db.connect()
  .then(() => {
    (async () => {
      // Get models
      const Cat = db.getCatModel();
      const Shelter = db.getShelterModel();
      const Application = db.getApplicationModel();
      const User = db.getUserModel();
      const Comment = db.getCommentModel();

      // Import routes
      const catRoutes = require("./routes/catsRoute")(
        Cat,
        Shelter,
        Application,
        User
      );
      const shelterRoutes = require("./routes/shelterRoute")(Cat, Shelter);
      const nestedRoutes = require("./routes/nestedRoutes")(Cat, Shelter);
      const authRoutes = require("./routes/authRoutes");
      const adminRoutes = require("./routes/adminRoutes")(
        Cat,
        Shelter,
        Application
      );
      const userRoutes = require("./routes/userRoutes")(Application, User);
      const commentRoutes = require("./routes/commentRoutes")(
        Comment,
        Shelter,
        User
      );

      // Seed database if empty
      const seedShelter = require("./seeds/seedShelters");
      const seedCat = require("./seeds/seedCats");

      if (!(await Shelter.findOne())) {
        console.log("No shelters found, seeding data...");
        await seedShelter(Shelter);
      }
      if (!(await Cat.findOne())) {
        console.log("No cats found, seeding data...");
        await seedCat(Cat, Shelter);
      }

      // =============================================================================
      // BASIC ROUTES
      // =============================================================================

      // Home redirect
      app.get("/", (req, res) => {
        res.redirect("/cats");
      });

      // Mount route modules
      app.use("/cats", catRoutes);
      app.use("/shelters", shelterRoutes);
      app.use("/shelters/:shelterId/cats", nestedRoutes);
      app.use("/api", authRoutes);
      app.use("/admin", adminRoutes);
      app.use("/user", userRoutes);

      app.use("/comment", commentRoutes);

      app.get("/adoptionProcess", (req, res) => {
        res.render("adoption/adoptionProcess.ejs");
      });

      app.get("/privacy", (req, res) => {
        res.json({
          message:
            "Privacy Policy: Your data is safe with us. We do not share your personal information with third parties without your consent.",
        });
      });
      app.use("/dataDeletion", (req, res) => {
        res.json({
          message:
            "Data Deletion Policy: You can request deletion of your data at any time by contacting us at your-email@example.com.",
        });
      });

      // =============================================================================
      // ERROR HANDLING
      // =============================================================================

      // 404 handler
      app.use((req, res) => {
        throw new AppError("Page not found", 404);
      });

      // Global error handler
      app.use((err, req, res, next) => {
        const { statusCode = 500, message = "Something went wrong" } = err;
        res.status(statusCode).render("error.ejs", { message });
      });

      // =============================================================================
      // START SERVER
      // =============================================================================

      app.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
    })();
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
