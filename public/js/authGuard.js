// ==========================================
// AUTH GUARD
// ==========================================

function requireRole(requiredRole) {

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!token) {

        redirectToLogin();

        return;
    }

    // ==========================================
    // CHECK ROLE
    // ==========================================

    if (userType !== requiredRole) {

        redirectToLogin();

        return;
    }
}


// ==========================================
// REDIRECT TO LOGIN
// ==========================================

function redirectToLogin() {

    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("role");

    window.location.replace("/pages/login.html");
}