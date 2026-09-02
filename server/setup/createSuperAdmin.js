require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/user");

const createSuperAdmin = async () => {
    try {

        await connectDB();

        const email = "lithinbv97@gmail.com";
        const password = "123456789";

        // Check if Super Admin already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("Super Admin already exists.");
            process.exit(0);
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create Super Admin
        await User.create({
            name: "Super Admin",
            email: email,
            password: hashedPassword,
            role: "SUPER_ADMIN"
        });

        console.log("Super Admin created successfully.");
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit(0);

    } catch (error) {

        console.error(
            "Error creating Super Admin:",
            error.message
        );

        process.exit(1);
    }
};

createSuperAdmin();