// Inkluderar Mongoose.
const mongoose = require("mongoose");

// Skapar review-schema för struktur.
const reviewSchema = new mongoose.Schema({
    movieId: {
        type: String, 
        required: [true, "Filmens ID krävs."]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, "Användarens ID krävs."]
    },
    rating: {
        type: Number,
        required: [true, "Betyg krävs."],
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        required: [true, "Recensionstext krävs."],
        trim: true
    }
}, { timestamps: true });

// Inkluderar schemat i databasen.
const Review = mongoose.model("Review", reviewSchema);

// Exporterar koden till server.js.
module.exports = Review;
