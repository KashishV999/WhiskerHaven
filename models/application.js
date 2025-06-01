// =============================================================================
// DEPENDENCIES
// =============================================================================

const mongoose = require('mongoose');
const { Schema } = mongoose;

// =============================================================================
// APPLICATION SCHEMA
// =============================================================================

const ApplicationSchema = new Schema({
    // =============================================================================
    // RELATIONSHIPS
    // =============================================================================
    
    shelter: {
        type: Schema.Types.ObjectId,
        ref: 'Shelter',
        required: true
    },
    cat: {
        type: Schema.Types.ObjectId,
        ref: 'Cat',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
 
    
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },

    
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
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ]
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, "Please enter a valid phone number"]
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 120
    },
    address: {
        type: String,
        required: true,
        trim: true
    },

    
    housingType: {
        type: String,
        required: true,
        enum: ['House', 'Apartment', 'Condo', 'Other'],
        default: 'House'
    },
    numberOfPeople: {
        type: Number,
        required: true,
        min: 1
    },

    
    previousPetOwnership: {
        type: Boolean,
        default: false
    },
    descriptionCatExperience: {
        type: String,
        trim: true
    },


    
    veterinaryCareDescription: {
        type: String,
        trim: true
    },
    monthlyExpenses: {
        type: Number,
        required: true,
        min: 0
    },
    responsiblePetOwnership: {
        type: Boolean,
        default: false
    },
    travelDescription: {
        type: String,
        trim: true
    },


    
    whyAdoptThisCat: {
        type: String,
        required: true,
        trim: true
    },
    additionalInfo: {
        type: String,
        trim: true
    }
}, { timestamps: true });


module.exports = ApplicationSchema;