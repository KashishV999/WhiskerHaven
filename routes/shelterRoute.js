// =============================================================================
// Shelter Routes
// =============================================================================
// Name: Kashish Verma
// Technologies: Node.js, Express.js, MongoDB, EJS
// Description: This file defines all routes related to managing shelters, including
// CRUD operations and rendering forms.
// =============================================================================

require("dotenv").config();
const express = require("express");
const router = express.Router();
const AppError = require("../AppError");
const { ValidateShelterSchema } = require("../schemasSecurity");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

const validateShelter = (req, res, next) => {
  const { error } = ValidateShelterSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new AppError(msg, 400);
  }
  next();
};

// =============================================================================
// ROUTE MODULE
// =============================================================================

module.exports = (Cat, Shelter) => {
  // =============================================================================
  // READ ROUTES (GET)
  // =============================================================================

  // Show all shelters
  router.get("/", async (req, res, next) => {
    try {
      const shelters = await Shelter.find({}).populate("cats");
      if (!shelters) {
        throw new AppError("No shelters found", 404);
      }
      res.render("shelters/index.ejs", { shelters });
    } catch (e) {
      next(e);
    }
  });

    // Render new shelter form
  router.get("/new", (req, res) => {
    res.render("shelters/new.ejs");
  });


  // Show details of a shelter
  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const shelter = await Shelter.findById(id).populate("cats");
      if (!shelter) {
        throw new AppError("Shelter not found", 404);
      }
      res.render("shelters/show.ejs", { shelter });
    } catch (e) {
      next(e);
    }
  });


  // Render edit form
  router.get("/:id/edit", async (req, res, next) => {
    try {
      const { id } = req.params;
      const shelter = await Shelter.findById(id);
      if (!shelter) {
        throw new AppError("Shelter not found", 404);
      }
      res.render("shelters/edit.ejs", { shelter });
    } catch (e) {
      next(e);
    }
  });

  // =============================================================================
  // CREATE ROUTES (POST)
  // =============================================================================

  // Create a new shelter
  router.post("/", upload.single("image"), validateShelter, async (req, res) => {
    try {
      const newShelter = new Shelter(req.body);
      if (req.file) {
        newShelter.image = req.file.path;
      }
      await newShelter.save();
      res.redirect(`/shelters/${newShelter._id}`);
    } catch (e) {
      console.error("Error creating shelter:", e);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // UPDATE ROUTES (PUT)
  // =============================================================================

  // Update a shelter
  router.put("/:id", upload.single("image"), async (req, res, next) => {
    try {
      const { id } = req.params;
      const shelter = await Shelter.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!shelter) {
        throw new AppError("Shelter not found", 404);
      }
      if (req.file) {
        shelter.image = req.file.path;
      }
      await shelter.save();
      res.redirect(`/shelters/${shelter._id}`);
    } catch (e) {
      next(e);
    }
  });

  // =============================================================================
  // DELETE ROUTES (DELETE)
  // =============================================================================

  // Delete a shelter
  router.delete("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      await Shelter.findByIdAndDelete(id);
      res.redirect("/admin/shelters");
    } catch (e) {
      next(e);
    }
  });

  return router;
};