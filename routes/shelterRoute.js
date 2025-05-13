const express= require('express');
const router= express.Router();
const Shelter= require('../models/shelter'); //import model for shelter
const Cat= require('../models/cat'); //import model for cat
const AppError = require("../AppError"); //import AppError class
const Joi = require('joi');

//show all shelters
router.get("/", async(req,res)=>{
    try{
    const shelters= await Shelter.find({}).populate('cats'); //find all shelters and populate the cats array
    if(!shelters){
        throw new AppError("No shelters found", 404);
    }
    res.render("shelters/index.ejs",{shelters}); //render the index page for shelters
}
catch(e){
    next(e); //pass the error to the next middleware
}
})


router.get("/new", (req,res)=>{
    res.render("shelters/new.ejs"); //render the new page for shelters
});

//show details of a shelter
router.get("/:id", async(req,res)=>{
    try{
    const {id}= req.params; //get the id from the url
    const shelter= await Shelter.findById(id).populate('cats', 'name image'); //find the shelter by id and populate the cats array
    if(!shelter){
        throw new AppError("Shelter not found", 404); //throw an error if the shelter is not found
    }
    res.render("shelters/show.ejs",{shelter}); //render the show page for the shelter
}
catch(e){
    next(e); //pass the error to the next middleware
}
});

//middleware for validating campground
const validateShelter=(req,res, next)=>{
    //JOi schema
const ShelterSchema=Joi.object({
    name:Joi.string().required().trim(), //string, required, trim
    location:Joi.string().required().trim(), //string, required, trim
    description:Joi.string().required().trim(), //string, required, trim
    phone:Joi.string().required().trim().pattern(/^\d{10}$/), //string, required, trim, regex for 10 digit phone number
    email:Joi.string().required().trim().email(), //string, required, trim, regex for email
    image:Joi.string().required().trim(), //string, required, trim
    cats:Joi.array().items(Joi.string()) //array of strings, required
})

    const { error } = ShelterSchema.validate(req.body, { abortEarly: false }); //abortEarly: false: This option is used to display all the validation errors instead of stopping after the first one.
    if(error){
        console.log(error.details);
        //map(el => el.message): The map function is used to transform each element 
        // in the error.details array. For each element (el), it extracts the message property,
        //  which contains the error message for that specific validation error.
        const msg= error.details.map(el=>el.message).join(',');
        throw new AppError(msg, 400);
       
    }
    else{
        next();
    }
}

router.post("/", validateShelter, async(req,res)=>{
    const newShelter= await Shelter.create(req.body); //create a new shelter
    res.redirect(`/shelters/${newShelter._id}`); //redirect to the show page for the new shelter
})


//render edit form
router.get("/:id/edit", async(req,res)=>{
try{
    const {id}= req.params; //get the id from the url
    const shelter= await Shelter.findById(id); //find the shelter by id
    if(!shelter){
        throw new AppError("Shelter not found", 404); //throw an error if the shelter is not found
    }
    res.render("shelters/edit.ejs",{shelter}); //render the edit page for the shelter
}
catch(e){
    next(e); //pass the error to the next middleware
}
})

router.put("/:id", async(req,res)=>{
    const {id}=req.params;
    const shelter= await Shelter.findByIdAndUpdate(id, req.body, {new:true}); //find the shelter by id and update it
    res.redirect(`/shelters/${shelter._id}`); //redirect to the show page for the updated shelter
})

router.delete("/:id", async(req,res)=>{
    console.log("delete route");
    const shelter = await Shelter.findByIdAndDelete(req.params.id); //find the shelter by id and delete it
    res.redirect("/shelters"); //redirect to the index page for shelters
})

module.exports= router; //export the router