const bcrypt = require("bcryptjs");

const Institution = require("../models/institution");
const InstitutionAdmin = require("../models/institutionAdmin");


// ==========================================
// CREATE INSTITUTION
// ==========================================

const createInstitution = async (req, res) => {

    // ==========================================
    // DEBUG LOG
    // ==========================================

    console.log("==========================================");
    console.log("CREATE INSTITUTION REQUEST RECEIVED");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);
    console.log("==========================================");


    try {

        // ==========================================
        // GET FORM DATA
        // ==========================================

        const {
            institutionName,
            state,
            region,
            username,
            password
        } = req.body;


        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (
            !institutionName ||
            !state ||
            !region ||
            !username ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message: "All fields are required."

            });

        }


        // ==========================================
        // CLEAN INPUT
        // ==========================================

        const cleanInstitutionName =
            institutionName.trim();

        const cleanState =
            state.trim();

        const cleanRegion =
            region.trim();

        const cleanUsername =
            username.trim();


        // ==========================================
        // VALIDATE PASSWORD
        // ==========================================

       const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

if (!passwordRegex.test(password)) {
    return res.status(400).json({
        success: false,
        message:
            "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character."
    });
}


        // ==========================================
        // CHECK USERNAME
        // ==========================================

        const existingAdmin =
            await InstitutionAdmin.findOne({

                username: cleanUsername

            });


        if (existingAdmin) {

            return res.status(400).json({

                success: false,

                message:
                    "Username already exists."

            });

        }


        // ==========================================
        // CREATE INSTITUTION
        // ==========================================

        console.log(
            "Creating institution..."
        );


        const institution =
            await Institution.create({

                name:
                    cleanInstitutionName,

                state:
                    cleanState,

                region:
                    cleanRegion

            });


        console.log(
            "Institution created:",
            institution._id
        );


        // ==========================================
        // HASH PASSWORD
        // ==========================================

        console.log(
            "Hashing admin password..."
        );


        const hashedPassword =
            await bcrypt.hash(

                password,

                10

            );


        // ==========================================
        // CREATE INSTITUTION ADMIN
        // ==========================================

        console.log(
            "Creating Institution Admin..."
        );


        const admin =
            await InstitutionAdmin.create({

                name:
                    "Institution Admin",

                username:
                    cleanUsername,

                password:
                    hashedPassword,

                institutionId:
                    institution._id

            });


        console.log(
            "Institution Admin created:",
            admin._id
        );


        // ==========================================
        // CONNECT ADMIN TO INSTITUTION
        // ==========================================

        institution.institutionAdminId =
            admin._id;


        await institution.save();


        console.log(
            "Institution and Admin connected successfully."
        );


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Institution created successfully.",

            institution: {

                id:
                    institution._id,

                name:
                    institution.name,

                state:
                    institution.state,

                region:
                    institution.region

            },

            admin: {

                id:
                    admin._id,

                username:
                    admin.username

            }

        });


    } catch (error) {

        // ==========================================
        // DETAILED ERROR
        // ==========================================

        console.error(
            "=========================================="
        );

        console.error(
            "CREATE INSTITUTION ERROR:"
        );

        console.error(
            "Name:",
            error.name
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Full Error:",
            error
        );

        console.error(
            "=========================================="
        );


        // ==========================================
        // ERROR RESPONSE
        // ==========================================

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to create institution."

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createInstitution

};