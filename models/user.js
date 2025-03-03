const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    subscription: {
        startDate: {
            type: Date,
            default: null // Default to null when the user has no subscription
        },
        endDate: {
            type: Date,
            default: null
        }
    },
    isVerified: {
        type: Boolean,
        default: false // To track whether the email is verified
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// Create and export User model
const User = mongoose.model('User', userSchema);
module.exports = User;
