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
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const {
  progressiveSearch,
  fallbackSearch,
  classifyUserIntent,
  generateAdoptionResponse,
  generateDonationResponse,
  handleOffTopicQuery,
  handleCatWellnessInfoQuery,
} = require("./services/openaiService");

// Custom modules
const AppError = require("./AppError");
const db = require("./config/database");
const { optionalJwtMiddleware } = require("./config/passportJwt");
const { name } = require("ejs");

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
      const paymentRoutes = require("./routes/paymentRoutes");
      const contactRoutes = require("./routes/contactRoutes");

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
      // ROUTES
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
      app.use("/", paymentRoutes);
      app.use("/contact", contactRoutes);

      app.get("/adoptionProcess", (req, res) => {
        res.render("adoption/adoptionProcess.ejs");
      });

      app.get("/about", (req, res) => {
        res.render("about.ejs");
      });



      // =============================================================================
      // OPEN-AI SEARCH ENDPOINT
      // =============================================================================
      // Main search endpoint with Atlas fallback
      app.post("/search", async (req, res) => {
        try {
          const { query, language, limit = 3, useAtlas = true } = req.body;

          console.log("--------------------------------------");
          console.log(`${query} - ${language}`);
          console.log("---------------------------------------");

          // Validate input
          if (
            !query ||
            typeof query !== "string" ||
            query.trim().length === 0
          ) {
            return res.status(400).json({
              error: "Invalid query",
              details: "Query must be a non-empty string",
            });
          }

          // Classify intent with error handling
          let intent;
          try {
            intent = await classifyUserIntent(query.trim());
            console.log("--------------------------------------");
            console.log("User intent:", intent);
            console.log("Query:", query);
            console.log("--------------------------------------");
          } catch (intentError) {
            console.error("Intent classification failed:", intentError);
            intent = "cat_search"; // Default to cat search if classification fails
          }

          // Handle different intents
          switch (intent) {
            case "cat_search":
              try {
                let results;

                if (useAtlas) {
                  try {
                    results = await progressiveSearch(
                      Cat,
                      query,
                      limit,
                      language
                    );
                  } catch (atlasError) {
                    console.warn(
                      "Atlas search failed, falling back to basic search:",
                      atlasError.message
                    );
                    results = await fallbackSearch(Cat, query, limit, language);
                  }
                } else {
                  results = await fallbackSearch(Cat, query, limit, language);
                }

                // Remove embedding fields from results
                const sanitizedResults = results.results.map((cat) => {
                  const { embedding, __v, ...cleanCat } = cat.toObject
                    ? cat.toObject()
                    : cat;
                  return cleanCat;
                });

                // Log results
                console.log("--------------------------------------");
                console.log("Found cats:", results.results.length);
                results.results.forEach((cat, index) => {
                  console.log(`${index + 1}. ${cat.name} (${cat._id})`);
                });
                console.log("Search explanation:", results.explanation);
                console.log("--------------------------------------");

                return res.json({
                  intent: intent,
                  results: sanitizedResults,
                  explanation: results.explanation,
                });
              } catch (searchError) {
                console.error("Search failed:", searchError);
                return res.status(500).json({
                  error: "Search failed",
                  intent: intent,
                  details: searchError.message,
                });
              }

            case "adoption_question":
              try {
                const response = await generateAdoptionResponse(
                  query,
                  language
                );
                return res.json({
                  intent: intent,
                  response: response,
                });
              } catch (error) {
                console.error("Adoption response failed:", error);
                return res.status(500).json({
                  error: "Failed to generate adoption response",
                  intent: intent,
                });
              }

            case "donation":
              try {
                const response = await generateDonationResponse(
                  query,
                  language
                );
                return res.json({
                  intent: intent,
                  response: response,
                });
              } catch (error) {
                console.error("Donation response failed:", error);
                return res.status(500).json({
                  error: "Failed to generate donation response",
                  intent: intent,
                });
              }

            case "cat_wellnessInfo":
              try {
                const response = await handleCatWellnessInfoQuery(
                  query,
                  language
                );
                return res.json({
                  intent: "cat_wellnessInfo",
                  response: response,
                });
              } catch (error) {
                console.error("Cat wellness info handler failed:", error);
                return res.status(500).json({
                  error: "Failed to generate cat wellness info",
                  intent: intent,
                });
              }

            default: // Handles "off_topic" and any unexpected intents
              try {
                const response = await handleOffTopicQuery(query, language);
                return res.json({
                  intent: "off_topic",
                  response: response,
                });
              } catch (error) {
                console.error("Off-topic handler failed:", error);
                return res.json({
                  intent: "off_topic",
                  response: "Me-wow! Let's talk about cats instead! 😸",
                });
              }
          }
        } catch (error) {
          console.error("Unexpected search endpoint error:", error);
          return res.status(500).json({
            error: "Internal server error",
            details: error.message,
          });
        }
      });

      app.get("/chatbot", (req, res) => {
        res.render("chatbot.ejs");
      });

      app.use(express.static(path.join(__dirname, "/public")));

      //For setting up the privacy and data deletion policies
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
