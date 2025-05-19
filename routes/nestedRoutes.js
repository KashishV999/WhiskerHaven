require("dotenv").config();
const express = require("express");
const passport = require("passport");
const { ValidateCatSchema } = require("../schemasSecurity"); //import Joi schema for cat
//NOTE: This allows the :shelterId parameter from the parent route (/shelters/:shelterId/cats) to be accessible in the nested router.
const router = express.Router({ mergeParams: true }); // Enable access to parent route parameters

const AppError = require("../AppError"); //import AppError class

const multer = require("multer");
const { storage } = require("../config/cloudinary"); // your path may vary
const upload = multer({ storage }); // multer middleware for handling file uploads

module.exports = (Cat, Shelter) => {
  router.get("/new", async (req, res) => {
    const { shelterId } = req.params; //get the shelter id from the url
    const shelter = await Shelter.findById(shelterId); //find the shelter by id
    res.render("cats/new.ejs", { shelter, shelters:null }); //render the new page for cats
  });

  const ValidateCat = (req, res, next) => {
    const { error } = ValidateCatSchema.validate(req.body, {
      abortEarly: false,
    }); //validate the cat data
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new AppError(msg, 400); //throw an error if the validation fails
    }
    next(); //if validation passes, call the next middleware
  };

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
      const { shelterId } = req.params;
      const newCat = new Cat(req.body);
      newCat.shelter = shelterId;
      if (req.file) {
        newCat.image = req.file.path;
      } else {
        console.log("No file uploaded");
      }
      await newCat.save();
      const shelter = await Shelter.findByIdAndUpdate(shelterId, {
        $push: { cats: newCat._id },
      });
      res.redirect("/admin/shelters");
    }
  );

  router.delete(
    "/:id",
   
    async (req, res) => {
      const { shelterId, id } = req.params; //get the shelter id and cat id from the url
      const shelter = await Shelter.findByIdAndUpdate(shelterId, {
        $pull: { cats: id },
      }); //update the shelter by removing the cat id
      await Cat.findByIdAndDelete(id); //delete the cat
      res.redirect(`/admin/cats`); //redirect to the show page for the shelter
    }
  );

  module.exports = router; //export the router

  return router; //return the router
};
