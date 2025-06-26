// =============================================================================
// Cats Routes
// =============================================================================
// Name: Kashish Verma
// Technologies: Node.js, Express.js, MongoDB, EJS
// Description: This file defines all routes related to managing cats, including
// CRUD operations, filtering, pagination, and adoption processes.
// =============================================================================

const express = require("express");
const router = express.Router();
const AppError = require("../AppError");
const { ValidateCatSchema } = require("../schemasSecurity");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const { generateCatEmbedding } = require('../services/openaiService');

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
module.exports = (Cat, Shelter, Application, User) => {
  // =============================================================================
  // READ ROUTES (GET)
  // =============================================================================

  // Show all cats with pagination and filtering
  router.get("/", async (req, res, next) => {
    try {
      const { page = 1, perPage = 6, search, age, ...filters } = req.query;
      let filter = {};

      if (search) {
        filter = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { breed: { $regex: search, $options: "i" } },
          ],
        };
      }

      const filterByAge = {
        kitten: { age: { $lt: 1 } },
        young: { age: { $gte: 1, $lt: 3 } },
        adult: { age: { $gte: 4, $lt: 10 } },
        senior: { age: { $gte: 10 } },
      }[age] || {};

      const booleanFields = [
        "spayed_neutered",
        "vaccinated",
        "microchipped",
        "special_needs",
        "house_trained",
        "good_with_children",
        "good_with_cats",
        "good_with_dogs",
      ];

      booleanFields.forEach((field) => {
        if (filters[field] !== undefined) {
          filter[field] = !!filters[field];
        }
      });

      const totalCats = await Cat.countDocuments(filter);
      const totalPages = Math.ceil(totalCats / perPage);

      const cats = await Cat.find({ ...filter, ...filterByAge })
        .skip((page - 1) * perPage)
        .limit(Number(perPage))
        .populate("shelter", "name");

      if (!cats || cats.length === 0) {
        throw new AppError("No cats found", 404);
      }

  
      let userFavorites=[];
      if(req.user){
        const user = await User.findById(req.user._id);
        userFavorites = user.favoriteCats;
      }

      console.log("User Favorites:", userFavorites);
      
      res.render("cats/index.ejs", {
        cats,
        currentPage: Number(page),
        perPage: Number(perPage),
        totalPages,
        userFavorites
      });
    } catch (e) {
      next(e);
    }
  });

  
  // Render new cat form
  router.get("/new", async (req, res) => {
    const shelters = await Shelter.find({});
    res.render("cats/new.ejs", { shelters, shelter: null });
  });

  
  // Show one cat
  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const cat = await Cat.findById(id).populate("shelter");
      if (!cat) {
        throw new AppError("Cat not found", 404);
      }

      let isFavorite = false;
      if (req.user) {
        const user = await User.findById(req.user._id);
        isFavorite = user.favoriteCats.includes(cat._id);
      }

      res.render("cats/show.ejs", { cat, user: req.user, isFavorite });
    } catch (e) {
      next(e);
    }
  });

  // Render edit form
  router.get("/:id/edit", async (req, res, next) => {
    try {
      const { id } = req.params;
      const cat = await Cat.findById(id);
      if (!cat) {
        throw new AppError("Cat not found", 404);
      }
      const shelters = await Shelter.find({});
      res.render("cats/edit.ejs", { cat, shelters });
    } catch (e) {
      next(e);
    }
  });

  // Render adoption application form
  router.get("/:id/application/new", async (req, res) => {
    const { id } = req.params;
    const cat = await Cat.findById(id).populate("shelter");
    
      res.render("adoption/adoptionForm.ejs", { cat });
    
  });

  // =============================================================================
  // CREATE ROUTES (POST)
  // =============================================================================

  // Create a new cat
  router.post(
    "/",
    upload.single("image"),
    (req, res, next) => {
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
      // Generate embedding vector for this cat
      const textToEmbed = `${req.body.description || ''} ${req.body.story || ''} ${req.body.breed || ''}`.trim();
      const embedding = await generateCatEmbedding(textToEmbed);

      const newCat = new Cat({...req.body, embedding });
      newCat.shelter = req.body.shelter;
      if (req.file) {
        newCat.image = req.file.path;
      }
      await newCat.save();
      await Shelter.findByIdAndUpdate(req.body.shelter, {
        $push: { cats: newCat._id },
      });
      res.redirect(`/admin/cats`);
    }
  );

  // Toggle favorite cat
  router.post("/:id/favorites", async (req, res, next) => {
    try {
      const { id } = req.params;
      const cat = await Cat.findById(id);
      if (!cat) {
        return next(new AppError("Cat not found", 404));
      }

      if (!req.user) {
        return next(new AppError("You must be logged in to favorite a cat", 401));
      }

      const user = await User.findById(req.user._id);
      const isFavorite = user.favoriteCats.includes(cat._id);

      if (isFavorite) {
        user.favoriteCats.pull(cat._id);
      } else {
        user.favoriteCats.push(cat._id);
      }

      await user.save();
      const currentPage = req.query.page || 1; // Default to page 1 if no page query is provided

      res.redirect(`/user/favorites`);
    } catch (error) {
      next(error);
    }
  });

  // Submit adoption application
  router.post("/:id/adopt", async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!req.user) {
        throw new AppError("You must be logged in to adopt a cat", 401);
      }

      const cat = await Cat.findById(id).populate("shelter");
      const shelterId = cat.shelter._id;

      if (cat.status !== "Adopted") {
        const application = new Application({
          ...req.body,
          user: req.user._id,
          cat: cat._id,
          shelter: shelterId,
          status: "Pending",
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
        });

        await application.save();
        res.redirect("/user/applications");
      } else {
        throw new AppError("Cat is already adopted", 400);
      }
    } catch (e) {
      next(e);
    }
  });

  // =============================================================================
  // UPDATE ROUTES (PUT)
  // =============================================================================

  // Update a cat
  router.put("/:id", upload.single("image"), async (req, res, next) => {
    try {
      const { id } = req.params;
      const textToEmbed = `${req.body.description || ''} ${req.body.story || ''} ${req.body.breed || ''}`.trim();

      const embedding = await generateCatEmbedding(textToEmbed);
     
      const cat = await Cat.findByIdAndUpdate(id, {...req.body, embedding}, { new: true });
      if (!cat) {
        throw new AppError("Cat not found", 404);
      }
      if (req.file) {
        cat.image = req.file.path;
      }
      await cat.save();
      res.redirect("/admin/cats");
    } catch (e) {
      next(e);
    }
  });

  return router;
};