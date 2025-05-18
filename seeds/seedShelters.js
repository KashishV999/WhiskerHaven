//seed Shelters into the database
const mongoose=require("mongoose");
const {Schema}=mongoose;
// const Shelter=require("../models/shelter"); //model for shelter
const shelterData=require("../data/shelterData"); //array data for shelter
// const connectDB=require("../config/database"); //connect to the database
//connectDB(); //connect to the database

module.exports=async(Shelter)=>{
    try{
    await Shelter.deleteMany({}); //delete all shelter in the database
    await Shelter.insertMany(shelterData) //insert data into the database
    console.log("Shelters Seeded Successfully")
    }
    catch(err){
        console.log(err)
    }

}



