// ==========================================
// SUPER ADMIN MIDDLEWARE
// ==========================================

const superAdminOnly = (req, res, next) => {

    try {

        // Check if authentication middleware
        // has already added the user
        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });

        }


        // ==========================================
        // CHECK USER TYPE
        // ==========================================

        // Your JWT should contain userType.
        //
        // We only allow SUPER_ADMIN to continue.

        if (
            req.user.userType !== "SUPER_ADMIN" &&
            req.user.role !== "SUPER_ADMIN"
        ) {

            return res.status(403).json({
                success: false,
                message: "Access denied. Super Admin only."
            });

        }


        // ==========================================
        // ALLOW REQUEST
        // ==========================================

        next();

    } catch (error) {

        console.error(
            "Super Admin authorization error:",
            error.message
        );

        return res.status(403).json({
            success: false,
            message: "Access denied."
        });

    }

};


module.exports = superAdminOnly;