const express = require('express');
const router = express.Router();
const Cat = require('../models/cat'); // Import the Cat model
const Shelter = require('../models/shelter'); // Import the Shelter model

// Show all cats
router.get("/", async (req, res) => {
    const cats = await Cat.find({}).populate('shelter', 'name'); // Find all cats and populate the shelter name
    res.render("cats/index.ejs", { cats });
});

// Render the new form page
router.get("/new", async (req, res) => {
    const shelters = await Shelter.find({}); // Find all shelters
    res.render("cats/new.ejs", { shelters }); // Render the new cat form
});

// Show one cat
router.get("/:id", async (req, res) => {
    const { id } = req.params; // Get the cat ID from the URL
    const cat = await Cat.findById(id).populate('shelter', 'name location phone email'); // Find the cat by ID and populate the shelter
    res.render("cats/show.ejs", { cat }); // Render the show page for the cat
});

// Render edit form
router.get("/:id/edit", async (req, res) => {
    const { id } = req.params; // Get the cat ID from the URL
    const cat = await Cat.findById(id); // Find the cat by ID
    const shelters = await Shelter.find({}); // Find all shelters
    res.render("cats/edit.ejs", { cat, shelters }); // Render the edit page for the cat
});

// Create a new cat
router.post("/", async (req, res) => {
    const newCat = await Cat.create(req.body);
    await Shelter.findByIdAndUpdate(newCat.shelter, { $push: { cats: newCat._id } }); // Update the shelter with the cat ID
    res.redirect(`/cats/${newCat._id}`); // Redirect to the show page for the new cat
});

// Update a cat
router.put("/:id", async (req, res) => {
    const { id } = req.params; // Get the cat ID from the URL
    const cat = await Cat.findByIdAndUpdate(id, req.body, { new: true }); // Find the cat by ID and update it
    res.redirect(`/cats/${cat._id}`); // Redirect to the show page for the updated cat
});

// Delete a cat
router.delete("/:id", async (req, res) => {
    const { id } = req.params; // Get the cat ID from the URL
    await Cat.findByIdAndDelete(id); // Find the cat by ID and delete it
    res.redirect("/cats"); // Redirect to the index page for all cats
});

module.exports = router;