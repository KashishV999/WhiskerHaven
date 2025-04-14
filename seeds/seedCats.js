//Seed Cats into DB
const mongoose = require("mongoose");
const connectDB = require("../config/database");
const Cat = require("../models/cat"); //model for cat
const Shelter = require("../models/shelter"); //model for shelter
const catData = require("../data/catData"); //array data for cat
connectDB();



//NOTE: No Way to Use await with forEach

const seedCats=async()=>{
//delete existing cats
//update the cats with the shelter id
//insert the cats into the database
//update the shelter with the cat id

await Cat.deleteMany({}); //delete all cats in the database

const shelters=await Shelter.find({}); //find all shelters in the database

if(shelters.length===0){
throw new Error("No shelters found in the database")
}


for(const cat of catData){
    const randomShelterIndex=Math.floor(Math.random()*shelters.length); //get a random shelter index

    cat.shelter=shelters[randomShelterIndex]._id; //set the shelter id for the cat
    const newCat= await Cat.create(cat);

    //update shelter's cat's array
    await Shelter.findByIdAndUpdate(shelters[randomShelterIndex]._id,{$push:{cats:newCat._id}}); //update the shelter with the cat id

}

console.log("Cats Seeded Successfully");
}

//call function to seed cats into the database
seedCats()
