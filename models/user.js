// Inkluderar Mongoose och Bcrypt.
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Sätter struktur för användaruppgifter med ett schema.
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    }
});

// Hashar lösenord.
userSchema.pre("save", async function (next) {
    try {
        if (this.isNew || this.isModified("password")) {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            // Ersätter det okrypterade lösenordet med det hashade lösenordet.
            this.password = hashedPassword;
        }
        
        next();
    // Felmeddelande.
    } catch (error) {
        next(error);
    }
});

// Jämför hashade lösenord vid inloggning.
userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    // Felmeddelande.
    } catch (error) {
        throw error;
    }
};

// Registrerar en användare.
userSchema.statics.register = async function (username, password) {
    try {
        // Skapar en ny användarinstans med valda användarnamn och lösenord.
        const user = new this({ username, password });
        // Sparar instansen i databasen med hashat lösenord.
        await user.save();
        return user;
    // Felmeddelande.
    } catch (error) {
        throw error;
    }
};

// Loggar in en användare.
userSchema.statics.login = async function (username, password) {
    try {
        const user = await this.findOne({ username });

        // Kontrollerar användarnamn.
        if (!user) {
            throw new Error("Felaktigt användarnamn eller lösenord");
        }

        // Kontrollerar om lösenord matchar.
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            throw new Error("Felaktigt användarnamn eller lösenord");
        }

        // Är både användarnamn och lösenord korrekt?
        return user;

    // Felmeddelande.
    } catch (error) {
        throw error;
    }
}

// Inkluderar schemat i databasen.
const User = mongoose.model("User", userSchema);
// Exporterar koden till authRoutes.js.
module.exports = User;