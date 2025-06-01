// =============================================================================
// DEPENDENCIES
// =============================================================================

const mongoose = require('mongoose');
const { Schema } = mongoose;

// =============================================================================
// COMMENT SCHEMA
// =============================================================================

const commentSchema = new Schema({
    // =============================================================================
    // RELATIONSHIPS
    // =============================================================================
    
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    
    content: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });



module.exports = commentSchema;