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
        required:true
    },
    age:{
        type:Number,
        required:true,
        min:0
    },
    color:{
        type:String,
        required:true
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
        required:true
    },
    image:{
        type:String,
        required:true
    },
    shelter:{
        type:Schema.Types.ObjectId,
        ref:'Shelter'
    }
});


const Cat= mongoose.model('Cat', CatSchema);
module.exports=Cat;