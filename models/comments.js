// =============================================================================
// DEPENDENCIES
// =============================================================================

const mongoose = require('mongoose');
const { Schema } = mongoose;

// =============================================================================
// COMMENT SCHEMA
// =============================================================================

const CommentSchema = new Schema({
postedBy:{
    type: Schema.Types.ObjectId,
    required:true,
    ref:"User"
},
shelterId:{
type:Schema.Types.ObjectId,
required:true,
ref:"Shelter"
},
text:{
    type:String,
    required:true
},
parentComment:{
    type:Schema.Types.ObjectId,
    ref:"Comment",
    default:null
},
replies:[{
    type: Schema.Types.ObjectId,
    ref: "Comment"
}]
}, { timestamps: true });

CommentSchema.pre("find", function( next){
    this.populate({path:"replies",
populate:{path:"postedBy"}
})
    next()
})


module.exports = CommentSchema;