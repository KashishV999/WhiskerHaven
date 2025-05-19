const express = require("express");
const router = express.Router();
const AppError = require("../AppError"); //import AppError class


const multer = require("multer");
const { storage } = require('../config/cloudinary'); // your path may vary
const upload = multer({ storage }); // multer middleware for handling file uploads



const passport = require('passport');

module.exports = (Cat, Shelter) => {

// Show all cats
// Show all cats
router.get("/", async (req, res, next) => {
  try {

   
    
    // Pagination and filtering
    const { page = 1, perPage = 6, search, age, ...filters } = req.query;
    
    // Build the filter object
    let filter = {};
    
    // Search filter
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { breed: { $regex: search, $options: "i" } }
        ]
      };
    }

    
  const filterByAge = {
  kitten: { age: { $lt: 1 } },
  young: { age: { $gte: 1, $lt: 3 } },
  adult: { age: { $gte: 4, $lt: 10 } },
  senior: { age: { $gte: 10 } }
  }[age] || {};

   // Boolean filters with !! conversion
    const booleanFields = [
      "spayed_neutered",
      "vaccinated",
      "microchipped",
      "special_needs",
      "house_trained",
      "good_with_children",
      "good_with_cats",
      "good_with_dogs"
    ];
    
    booleanFields.forEach(field => {
      if (filters[field] !== undefined) {
        // Using !! to convert to boolean
        filter[field] = !!filters[field];
      }
    });
    
    // Count total matching cats
    const totalCats = await Cat.countDocuments(filter);
    const totalPages = Math.ceil(totalCats / perPage);
    

    console.log(filter);


    // Get paginated results
    const cats = await Cat.find({ ...filter, ...filterByAge })
      .skip((page - 1) * perPage)
      .limit(Number(perPage))
      .populate("shelter", "name")
      .exec();
    
    if (!cats || cats.length === 0) {
      throw new AppError("No cats found", 404);
    }
    
    res.render("cats/index.ejs", { 
      cats, 
      currentPage: Number(page), 
      perPage: Number(perPage), 
      totalPages,
   
    });
  } catch (e) {
    next(e);
  }
});

// // Render the new form page
// router.get("/new", async (req, res) => {
//     const shelters = await Shelter.find({}); // Find all shelters
//     res.render("cats/new.ejs", { shelters }); // Render the new cat form
// });

// Show one cat
router.get("/:id", async (req, res,next) => {
    try{
  const { id } = req.params; // Get the cat ID from the URL
  const cat = await Cat.findById(id).populate("shelter"); // Find the cat by ID and populate the shelter
    if(!cat){
        throw new AppError("Cat not found", 404); // Throw an error if the cat is not found
    }

  res.render("cats/show.ejs", { cat }); // Render the show page for the cat
}
catch(e){
    next(e);
}
});



// Render edit form
router.get("/:id/edit", async (req, res,next) => {
    try{
  const { id } = req.params; // Get the cat ID from the URL
  const cat = await Cat.findById(id); // Find the cat by ID
  if(!cat){
    throw new AppError("Cat not found", 404); // Throw an error if the cat is not found
  }
  const shelters = await Shelter.find({}); // Find all shelters
  res.render("cats/edit.ejs", { cat, shelters }); // Render the edit page for the cat
}
catch(e){
    next(e);
}
});

// // Create a new cat
// router.post("/", async (req, res) => {
//     const newCat = await Cat.create(req.body);
//     await Shelter.findByIdAndUpdate(newCat.shelter, { $push: { cats: newCat._id } }); // Update the shelter with the cat ID
//     res.redirect(`/cats/${newCat._id}`); // Redirect to the show page for the new cat
// });

// Update a cat
router.put("/:id", upload.single("image"),  async (req, res,next) => {
    try{
  const { id } = req.params; // Get the cat ID from the URL
  const cat = await Cat.findByIdAndUpdate(id, req.body, { new: true }); // Find the cat by ID and update it
  if(!cat){
    throw new AppError("Cat not found", 404); // Throw an error if the cat is not found
  }
  if (req.file) {
    cat.image = req.file.path; //set the image path if a file was uploaded
  }
  await cat.save(); //save the updated cat
  res.redirect(`/cats/${cat._id}`); // Redirect to the show page for the updated cat
}
catch(e){
    next(e);
}
});

// // Delete a cat
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params; // Get the cat ID from the URL
//   await Cat.findByIdAndDelete(id); // Find the cat by ID and delete it
//   res.redirect("/cats"); // Redirect to the index page for all cats
// });



  return router;
};


