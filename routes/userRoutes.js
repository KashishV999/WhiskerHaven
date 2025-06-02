// =============================================================================
// User Routes
// =============================================================================
// Name: Kashish Verma
// Technologies: Node.js, Express.js, MongoDB, EJS
// Description: This file defines all user-related routes, including viewing
// applications and managing favorite cats.
// =============================================================================

const express = require("express");
const router = express.Router();
const AppError = require("../AppError");

module.exports = (Application, User) => {
  // =============================================================================
  // READ ROUTES (GET)
  // =============================================================================

  // User - View their applications
  router.get("/applications", async (req, res, next) => {
    try {
      const applications = await Application.find({ user: req.user._id })
        .populate("cat")
        .populate("shelter");

      res.render("users/index.ejs", { applications });
    } catch (e) {
      next(e);
    }
  });

  // User - View favorite cats
  router.get("/favorites", async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate("favoriteCats");
      if (!user) {
        throw new AppError("User not found", 404);
      }
      res.render("users/favorites.ejs", { user });
    } catch (e) {
      next(e);
    }
  });

  return router;
};