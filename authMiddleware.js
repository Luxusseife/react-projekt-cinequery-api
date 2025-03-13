// Inkluderar JWT.
const jwt = require("jsonwebtoken");

// Validerar token för åtkomst till skyddad resurs och för att hantera recensioner.
function authenticateToken(req, res, next) {
    // Hämtar authorization-header.
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        console.log("No Authorization header sent");
        return res.status(401).json({ message: "Ingen behörighet för Min sida - token saknas." });
    }

    // Om headern finns, extraheras token från den.
    const token = authHeader && authHeader.split(" ")[1];

    // Kontrollerar om en giltig token finns.
    if (token == null) return res.status(401).json({ message: "Ingen behörighet för Min sida - token saknas." });

    // Kontrollerar JWT.
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Ingen behörighet för Min sida - ogiltig token." });

        req.user = user;
        next();
    });
}

// Exporterar JWT-verifiering till authRoutes och reviewRoutes.
module.exports = { authenticateToken };