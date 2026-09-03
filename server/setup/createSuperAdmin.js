require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const SuperAdmin = require("../models/superAdmin");

const createSuperAdmin = async () => {
    try {

        await connectDB();

        const email = "lithinbv97@gmail.com";
        const password = "123456789";

        // Check if Super Admin already exists
        const existingSuperAdmin = await SuperAdmin.findOne({
            email
        });

        if (existingSuperAdmin) {
            console.log("Super Admin already exists.");
            process.exit(0);
        }

        // Encrypt password
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        // Create Super Admin
        await SuperAdmin.create({
            name: "Super Admin",
            email: email,
            password: hashedPassword
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