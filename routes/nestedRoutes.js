// =============================================================================
// Nested Routes
// =============================================================================
// Name: Kashish Verma
// Technologies: Node.js, Express.js, MongoDB, EJS
// Description: This file defines nested routes for managing cats within specific shelters.
// =============================================================================

require("dotenv").config();
const express = require("express");
const AppError = require("../AppError");
const { ValidateCatSchema } = require("../schemasSecurity");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// Enable access to parent route parameters
const router = express.Router({ mergeParams: true });

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

const ValidateCat = (req, res, next) => {
  const { error } = ValidateCatSchema.validate(req.body, { abortEarly: false });
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
  // FORM ROUTES
  // =============================================================================

  // Render new cat form for a specific shelter
  router.get("/new", async (req, res) => {
    try {
      const { shelterId } = req.params;
      const shelter = await Shelter.findById(shelterId);
      if (!shelter) {
        throw new AppError("Shelter not found", 404);
      }
      res.render("cats/new.ejs", { shelter, shelters: null });
    } catch (err) {
      console.error("Error rendering new cat form:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  // =============================================================================
  // CREATE ROUTES
  // =============================================================================

  // Create a new cat for a specific shelter
  router.post(
    "/",
    upload.single("image"),
    (req, res, next) => {
      // Convert checkbox values to booleans
      req.body.spayed_neutered = !!req.body.spayed_neutered;
      req.body.vaccinated = !!req.body.vaccinated;
      req.body.microchipped = !!req.body.microchipped;
      req.body.special_needs = !!req.body.special_needs;
      req.body.house_trained = !!req.body.house_trained;
      req.body.good_with_children = !!req.body.good_with_children;
      req.body.good_with_cats = !!req.body.good_with_cats;
      req.body.good_with_dogs = !!req.body.good_with_dogs;
      next();
    },
    ValidateCat,
    async (req, res) => {
      try {
        const { shelterId } = req.params;
        const newCat = new Cat(req.body);
        newCat.shelter = shelterId;

        if (req.file) {
          newCat.image = req.file.path;
        }

        await newCat.save();
        await Shelter.findByIdAndUpdate(shelterId, {
          $push: { cats: newCat._id },
        });

        res.redirect("/admin/shelters");
      } catch (err) {
        console.error("Error creating new cat:", err);
        res.status(500).send("Internal Server Error");
      }
    }
  );

  // =============================================================================
  // DELETE ROUTES
  // =============================================================================

  // Delete a cat from a specific shelter
  router.delete("/:id", async (req, res) => {
    try {
      const { shelterId, id } = req.params;

      await Shelter.findByIdAndUpdate(shelterId, {
        $pull: { cats: id },
      });

      await Cat.findByIdAndDelete(id);
      res.redirect(`/admin/cats`);
    } catch (err) {
      console.error("Error deleting cat:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
};