// Inkluderar Express, Cors, Mongoose, dotenv och autentisering.
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const { authenticateToken } = require("./authMiddleware");

// Initialiserar Express.
const app = express();

// Väljer port.
const port = process.env.PORT || 3000;

// Middleware. Aktiverar hantering av JSON-data och Cors.
app.use(express.json());
app.use(cors());

// Importerar route för recensioner och ställer in grundläggande sökväg.
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/", reviewRoutes);

// Ansluter till MongoDB-databasen.
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URL)
    // Lyckad anslutning.
    .then(() => {
        console.log("Ansluten till databasen!");
    })
    // Fel vid anslutning.
    .catch((error) => {
        console.error("Fel vid anslutning till databasen: " + { error });
    });

// Route för skyddad resurs - Min sida.
app.get("/mypage", authenticateToken, (req, res) => {
    res.json({ message: "Du har nu åtkomst till Min sida." })
});

// Routes för att validera token.
app.get("/validate-token", authenticateToken, (req, res) => {
    res.status(200).json({ user: req.user });
});

// Importerar route för auth och ställer in grundläggande sökväg.
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// Startar Express-servern.
app.listen(port, () => {
    console.log("Servern körs på följande port: " + port);
});