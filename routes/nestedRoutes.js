const express= require('express');
const {ValidateCatSchema}= require('../schemasSecurity'); //import Joi schema for cat
//NOTE: This allows the :shelterId parameter from the parent route (/shelters/:shelterId/cats) to be accessible in the nested router.
const router = express.Router({ mergeParams: true }); // Enable access to parent route parameters
const Shelter= require('../models/shelter'); //import model for shelter
const Cat= require('../models/cat'); //import model for cat
const AppError = require("../AppError"); //import AppError class

router.get("/new",async(req,res)=>{
    const {shelterId}= req.params; //get the shelter id from the url
    const shelter= await Shelter.findById(shelterId); //find the shelter by id
    res.render("cats/new.ejs", {shelter}); //render the new page for cats
})



const ValidateCat=(req,res,next)=>{
    const {error}=ValidateCatSchema.validate(req.body, {abortEarly:false}); //validate the cat data
    if(error){
        const msg= error.details.map((el)=>el.message).join(",");
        throw new AppError(msg, 400); //throw an error if the validation fails
    }
    next(); //if validation passes, call the next middleware
}



router.post("/", ValidateCat,async(req,res)=>{
    const {shelterId}= req.params; //get the shelter id from the url
    const newCat= new Cat(req.body); //create a new cat
    newCat.shelter= shelterId; //set the shelter id for the new cat
    await newCat.save(); //save the new cat
    const shelter= await Shelter.findByIdAndUpdate(shelterId, {$push:{cats:newCat._id}}); //update the shelter with the new cat id
    res.redirect(`/shelters/${shelter._id}`); //redirect to the show page for the new cat
})


router.delete("/:id", async(req,res)=>{
    const {shelterId, id}= req.params; //get the shelter id and cat id from the url
    const shelter= await Shelter.findByIdAndUpdate(shelterId, {$pull:{cats:id}}); //update the shelter by removing the cat id
    await Cat.findByIdAndDelete(id); //delete the cat
    res.redirect(`/shelters/${shelter._id}`); //redirect to the show page for the shelter
})


module.exports= router; //export the router