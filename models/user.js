// =============================================================================
// DEPENDENCIES
// =============================================================================

const mongoose = require('mongoose');
const { Schema } = mongoose;

// =============================================================================
// USER SCHEMA
// =============================================================================

const userSchema = new Schema({
    // =============================================================================
    // RELATIONSHIPS
    // =============================================================================
    
    favoriteCats: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Cat'
        }
    ],

    
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },

    
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ]
    },
    password: {
        type: String,
        required: function() {
            // password required only if no googleId or facebookId
            return !this.googleId && !this.facebookId;
        },
        minlength: 6
    },

    
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    googleId:{
        type: String,
        unique: true,
        sparse: true // only apply the uniqueness check to documents where googleId is set (i.e., not null or undefined).
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true // only apply the uniqueness check to documents where facebookId is set (i.e., not null or undefined).
    },
}, { timestamps: true });


module.exports = userSchema;