const express= require('express');
const router= express.Router();
const Shelter= require('../models/shelter'); //import model for shelter
const Cat= require('../models/cat'); //import model for cat

//show all shelters
router.get("/", async(req,res)=>{
    const shelters= await Shelter.find({}).populate('cats'); //find all shelters and populate the cats array
    res.render("shelters/index.ejs",{shelters}); //render the index page for shelters
})


router.get("/new", (req,res)=>{
    res.render("shelters/new.ejs"); //render the new page for shelters
});

//show details of a shelter
router.get("/:id", async(req,res)=>{
    const {id}= req.params; //get the id from the url
    const shelter= await Shelter.findById(id).populate('cats', 'name image'); //find the shelter by id and populate the cats array
    res.render("shelters/show.ejs",{shelter}); //render the show page for the shelter
})


router.post("/", async(req,res)=>{
    const newShelter= await Shelter.create(req.body); //create a new shelter
    res.redirect(`/shelters/${newShelter._id}`); //redirect to the show page for the new shelter
})


module.exports= router; //export the router