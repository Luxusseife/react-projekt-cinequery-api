// Inkluderar Express, router, review-modellen och autentisering.
const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const { authenticateToken } = require("../authMiddleware");

// Hämtar in API:et.
router.get("/api", async (req, res) => {
    res.json({ message: "Välkommen till backend-API:et!" });
});

// Hämtar en specifik recension baserat på recensionens ID.
router.get("/reviews/:id", async (req, res) => {

    // Hämtar recensionens ID från URL:en.
    const reviewId = req.params.id; 

    try {
        // Hämtar recensionen baserat på ID och inkluderar användarnamn från "userId".
        let result = await Review.findById(reviewId).populate("userId", "username");

        // Om recensionen saknas, skickas ett felmeddelande.
        if (!result) {
            return res.status(404).json({ error: "Kunde inte hitta recensionen med angivet ID." });
        } else {
            // Om recensionen finns, returneras den.
            return res.json({
                message: "Recensionen hittades!",
                foundReview: result
            });
        }
    } catch (error) {
        // Felmeddelande.
        return res.status(500).json({ error: "Något gick fel vid hämtning av recensionen: " + error });
    }
});

// Dynamisk route som kan hämta alla lagrade recensioner oavsett författare, hämta recensioner för viss film samt 
// recensioner för en viss film från en viss användare.
router.get("/reviews", async (req, res) => {
    try {

        // Hämtar query-parametrar.
        const { userId, movieId } = req.query;

        // Dynamiskt filter-objekt.
        let filter = {};
        if (userId) filter.userId = userId;
        if (movieId) filter.movieId = movieId;
        
        // Hämtar in recensioner.
        let result = await Review.find(filter);

        // Kontroll av innehåll och en tom array om collection är tom. Resursen finns men är tom!
        if (result.length === 0) {
           return res.status(200).json([]);

            // Om recensioner finns, skrivs dessa ut.
        } else {
            return res.json(result);
        }
    } catch (error) {
        // Felmeddelande.
       return res.status(500).json({ error: "Något gick fel vid hämtning av recensioner: " + error });
    }
});

// Skapar/lagrar en recension (användare måste vara inloggad!).
router.post("/reviews", authenticateToken, async (req, res) => {
    try {

        // Hämtar data från body/inputfält.
        const { movieId, rating, reviewText } = req.body;

        // Skapar en recension kopplad till den inloggade användaren.
        const review = new Review({
            movieId,
            userId: req.user.id,
            rating,
            reviewText
        });

        // Sparar recensionen i databasen.
        const result = await review.save();

        // Respons vid lyckad inmatning.
        return res.json({
            message: "Recensionen lades till!",
            newReview: result
        });
    } catch (error) {
        // Felmeddelande.
        return res.status(400).json({ error: error.message || "Felaktig inmatning. Prova igen!" });
    }
});

// Hämtar recensioner för en specifik film baserat på filmens ID.
router.get("/reviews/movie/:movieId", async (req, res) => {
    
    // Hämtar filmens ID från URL:en.
    const movieId = req.params.movieId; 

    try {
        // Hämtar alla recensioner för filmen och inkluderar användarnamn från "userId".
        let result = await Review.find({ movieId }).populate("userId", "username");

        // Om inga recensioner finns för filmen, skickas det tillbaka ett meddelande.
        if (result.length === 0) {
            return res.status(200).json({ message: "Inga recensioner hittades." });
        } else {
            // Om recensioner finns, returneras dessa.
            return res.json(result);
        }
    } catch (error) {
        // Felmeddelande.
        return res.status(500).json({ error: "Något gick fel vid hämtning av recensioner: " + error });
    }
});

// Uppdaterar en recension (användare måste vara inloggad och ha skrivit recensionen!).
router.put("/reviews/:id", authenticateToken, async (req, res) => {

    // Hämtar in recensionens ID och nya input-värden.
    const reviewId = req.params.id;
    const updatedReview = req.body;

    try {
        // Hämtar recensionen och kollar att den tillhör den inloggade användaren.
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Recensionen finns inte." });
        }

        // Kontrollera om den inloggade användaren är samma som författare av recensionen.
        if (review.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "Du har inte behörighet att uppdatera denna recension." });
        }

        // Uppdaterar recensionen.
        const result = await Review.findByIdAndUpdate(reviewId, updatedReview, { new: true });

        // Respons vid lyckad uppdatering.
        return res.json({
            message: "Recensionen uppdaterades!",
            updatedReview: result
        });
    } catch (error) {
        // Felmeddelande.
        return res.status(500).json({ error: "Något gick fel vid uppdatering av recensionen: " + error });
    }
});

// Raderar en recension (användare måste vara inloggad och ha skrivit recensionen!).
router.delete("/reviews/:id", authenticateToken, async (req, res) => {

    // Hämtar recensionens ID.
    const reviewId = req.params.id;

    try {
        // Hämtar recensionen och kollar att den tillhör den inloggade användaren.
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Recensionen finns inte." });
        }

        // Kontrollera om den inloggade användaren är samma som författare av recensionen.
        if (review.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: "Du har inte behörighet att radera denna recension." });
        }

        // Raderar recensionen.
        const result = await Review.findByIdAndDelete(reviewId);

        // Respons vid lyckad radering.
        return res.json({
            message: "Recensionen raderades!",
            deletedReview: result
        });
    } catch (error) {
        // Felmeddelande.
        return res.status(500).json({ error: "Något gick fel vid radering av recensionen: " + error });
    }
});

// Exporterar koden till server.js.
module.exports = router;
