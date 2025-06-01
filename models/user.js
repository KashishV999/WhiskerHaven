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
        required: true,
        minlength: 6
    },

    
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true });


module.exports = userSchema;