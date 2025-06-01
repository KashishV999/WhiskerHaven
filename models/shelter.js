//define Schema and model for shelter

const { mongoose } = require("mongoose");
const { Schema } = mongoose;
const Cat =require('./cat'); //import the Cat model
const { application } = require("express");
const ShelterSchema= new Schema({
    name:{
        type:String,
        required:true,  
        trim:true
    },
    location:{
        type:String,
        required:true,
        trim:true,
        index: true  // add index on location
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        /**The regex /^\d{10}$/ ensures that the phone number:
            Contains exactly 10 digits.
            Does not allow letters, special characters, or spaces. */
        match: [/^\d{10}$/, "Phone number must be 10 digits"], // Regex for 10-digit phone number
    },
    email:{
        type:String,
        required:true,
        trim:true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address",
        ], // Regex for email validation
    },
    image:{
        type:String,
        trim:true
    },
    cats:[
        {
            type:Schema.Types.ObjectId,
            ref:'Cat'
        }
    ],



    hours: {
        type: Schema.Types.Mixed,  // store operating hours as JSON object
        default: {}
    },
    mission: {
        type: String,
        trim: true,
        default: ''
    }}, { timestamps: true });



//hook to remove the cats when the shelter is deleted
// The post middleware is executed after the findOneAndDelete operation
ShelterSchema.post('findOneAndDelete', async function (shelter) {
    console.log(shelter);
    console.log(shelter.cats.length);
    console.log(shelter.cats);
    if (shelter.cats.length) {
        await Cat.deleteMany({ _id: { $in: shelter.cats } });
    }
});


//const Shelter= mongoose.model('Shelter', ShelterSchema);
module.exports= ShelterSchema;