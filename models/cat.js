//define schema and model for cat
const mongoose = require('mongoose');
const { Schema } = mongoose;
const CatSchema=new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },

    breed:{
        type:String,
        trim:true,
        required:true
    },
    age:{
        type:Number,
        required:true,
        min:0
    },
    color:{
        type:String,
        required:true,
        trim:true
    },
    weight:{
        type:Number,
        required:true,
        min:[0, 'Weight must be a positive number']
    },
    gender:{
        type:String,
        required:true,
        enum: ['Male', 'Female']
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String,
    },
    shelter:{
        type:Schema.Types.ObjectId,
        ref:'Shelter'
    },

    status: {
        type: String,
        enum: ['Available', 'Pending', 'Adopted'],
        default: 'Available'
    },
    arrival_date: {
        type: Date,
        default: Date.now
    },
    adoption_fee: {
        type: mongoose.Types.Decimal128,  // or Number if you prefer
        default: 0.00,
        min: 0
    },
    spayed_neutered: {
        type: Boolean,
        default: false
    },
    vaccinated: {
        type: Boolean,
        default: false
    },
    microchipped: {
        type: Boolean,
        default: false
    },
    special_needs: {
        type: Boolean,
        default: false
    },
    house_trained: {
        type: Boolean,
        default: false
    },
    activity_level: {
        type: String,
        enum: ['Low', 'Moderate', 'High'],
        default: 'Moderate'
    },
    coat_length: {
        type: String,
        enum: ['Short', 'Medium', 'Long'],
        default: 'Short'
    },
    good_with_children: {
        type: Boolean,
        default: null
    },
    good_with_cats: {
        type: Boolean,
        default: null
    },
    good_with_dogs: {
        type: Boolean,
        default: null
    },
    story: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true }); // automatically adds createdAt and updatedAt fields


//const Cat= mongoose.model('Cat', CatSchema);
module.exports=CatSchema;