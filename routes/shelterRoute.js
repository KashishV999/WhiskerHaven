require("dotenv").config();
const express = require("express");
const router = express.Router();
const AppError = require("../AppError"); //import AppError class
const passport = require("passport");
const { ValidateShelterSchema } = require("../schemasSecurity"); //import Joi schema for shelter

const multer = require("multer");
const { storage } = require("../config/cloudinary"); // your path may vary
const upload = multer({ storage }); // multer middleware for handling file uploads

module.exports = (Cat, Shelter) => {
  //show all shelters
  router.get("/", async (req, res, next) => {
    try {
      const shelters = await Shelter.find({}).populate("cats"); //find all shelters and populate the cats array
      if (!shelters) {
        throw new AppError("No shelters found", 404);
      }
      res.render("shelters/index.ejs", { shelters }); //render the index page for shelters
    } catch (e) {
      next(e); //pass the error to the next middleware
    }
  });

  router.get("/new", (req, res) => {
    res.render("shelters/new.ejs"); //render the new page for shelters
  });

  //show details of a shelter
  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params; //get the id from the url
      const shelter = await Shelter.findById(id).populate("cats"); //find the shelter by id and populate the cats array
      if (!shelter) {
        throw new AppError("Shelter not found", 404); //throw an error if the shelter is not found
      }
      res.render("shelters/show.ejs", { shelter }); //render the show page for the shelter
    } catch (e) {
      next(e); //pass the error to the next middleware
    }
  });

  //middleware for validating campground
  const validateShelter = (req, res, next) => {
    const { error } = ValidateShelterSchema.validate(req.body, {
      abortEarly: false,
    }); //abortEarly: false: This option is used to display all the validation errors instead of stopping after the first one.
    if (error) {
      console.log(error.details);
      //map(el => el.message): The map function is used to transform each element
      // in the error.details array. For each element (el), it extracts the message property,
      //  which contains the error message for that specific validation error.
      const msg = error.details.map((el) => el.message).join(",");
      throw new AppError(msg, 400);
    } else {
      next();
    }
  };

  router.post(
    "/",
    upload.single("image"),
    validateShelter,
    async (req, res) => {
      //const newShelter = await Shelter.create(req.body); //create a new shelter
      const newShelter = new Shelter(req.body); //create a new shelter
      if (req.file) {
        newShelter.image = req.file.path; //set the image path for the new shelter
        console.log(newShelter.image);
      } else {
        console.log("no image");
      }
      await newShelter.save(); //save the new shelter

      res.redirect(`/shelters/${newShelter._id}`); //redirect to the show page for the new shelter
    }
  );

  //render edit form
  router.get("/:id/edit", async (req, res, next) => {
    try {
      const { id } = req.params; //get the id from the url
      const shelter = await Shelter.findById(id); //find the shelter by id
      if (!shelter) {
        throw new AppError("Shelter not found", 404); //throw an error if the shelter is not found
      }
      res.render("shelters/edit.ejs", { shelter }); //render the edit page for the shelter
    } catch (e) {
      next(e); //pass the error to the next middleware
    }
  });

  router.put("/:id", upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const shelter = await Shelter.findByIdAndUpdate(id, req.body, {
      new: true,
    }); //find the shelter by id and update it
    if (req.file) {
      shelter.image = req.file.path; //set the image path if a file was uploaded
    }
    await shelter.save(); //save the updated shelter
    res.redirect(`/shelters/${shelter._id}`); //redirect to the show page for the updated shelter
  });

  router.delete("/:id", async (req, res) => {
    console.log("delete route");
    const shelter = await Shelter.findByIdAndDelete(req.params.id); //find the shelter by id and delete it
    res.redirect("/admin/shelters"); //redirect to the index page for shelters
  });

  return router; //return the router
};
