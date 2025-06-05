// =============================================================================
// DEPENDENCIES
// =============================================================================

const { mongoose } = require("mongoose");
const { Schema } = mongoose;
const Cat = require('./cat');

// =============================================================================
// SHELTER SCHEMA
// =============================================================================

const ShelterSchema = new Schema({
    // =============================================================================
    // RELATIONSHIPS
    // =============================================================================
    
    cats: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Cat'
        }
    ],

    
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    coordinates: {
        lat: {
            type: Number
        },
        lng: {
            type: Number
        }
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    mission: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        trim: true
    },

    
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, "Phone number must be 10 digits"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ]
    },

    
    hours: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });


// Remove associated cats when shelter is deleted
ShelterSchema.post('findOneAndDelete', async function (shelter) {
    console.log(shelter);
    console.log(shelter.cats.length);
    console.log(shelter.cats);
    if (shelter.cats.length) {
        await Cat.deleteMany({ _id: { $in: shelter.cats } });
    }
});



module.exports = ShelterSchema;