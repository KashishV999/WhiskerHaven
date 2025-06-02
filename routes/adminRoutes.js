// =============================================================================
// Admin Routes
// =============================================================================
// Name: Kashish Verma
// Technologies: Node.js, Express.js, MongoDB, EJS
// Description: This file defines all admin-related routes for managing cats, shelters, and applications.
// =============================================================================

const express = require("express");
const router = express.Router();
const { isAdmin } = require("../config/passportJwt");
const AppError = require("../AppError");

module.exports = (Cat, Shelter, Application) => {
  // =============================================================================
  // Admin - Manage Cats
  // =============================================================================
  router.get("/cats", async (req, res) => {
    try {
      const cats = await Cat.find({}).populate("shelter");
      res.render("adminDashboard/catsManage.ejs", { cats });
    } catch (err) {
      console.error("Error fetching cats:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - Manage Shelters
  // =============================================================================
  router.get("/shelters", async (req, res) => {
    try {
      const shelters = await Shelter.find({});
      res.render("adminDashboard/sheltersManage.ejs", { shelters });
    } catch (err) {
      console.error("Error fetching shelters:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - View All Applications
  // =============================================================================
  router.get("/applications", isAdmin, async (req, res) => {
    try {
      const applications = await Application.find({})
        .populate("cat")
        .populate("user")
        .populate("shelter");
      res.render("adminDashboard/applicationsManage.ejs", { applications });
    } catch (err) {
      console.error("Error fetching applications:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - View Single Application
  // =============================================================================
  router.get("/applications/:id", isAdmin, async (req, res, next) => {
    try {
      const application = await Application.findById(req.params.id)
        .populate("cat")
        .populate("user")
        .populate("shelter");
      if (!application) {
        return next(new AppError("Application not found", 404));
      }
      res.render("adminDashboard/showApplication.ejs", { application });
    } catch (err) {
      console.error("Error fetching application:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // Admin - Update Application Status
  // =============================================================================
  router.patch("/applications/:id", isAdmin, async (req, res, next) => {
    try {
      const application = await Application.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!application) {
        return next(new AppError("Application not found", 404));
      }
      res.redirect("/admin/applications");
    } catch (err) {
      console.error("Error updating application:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
};