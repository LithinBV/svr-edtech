// ============================================================
// ELEMENTS
// ============================================================

const loginForm = document.getElementById("adminLoginForm");

const otpForm = document.getElementById("otpForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const otpInput = document.getElementById("otp");

const loginButton = document.getElementById("loginButton");

const verifyOtpButton = document.getElementById("verifyOtpButton");

const loginMessage = document.getElementById("loginMessage");

const otpMessage = document.getElementById("otpMessage");

const otpEmail = document.getElementById("otpEmail");

const backToLogin = document.getElementById("backToLogin");

const loginHeading = document.getElementById("loginHeading");

const socialSection = document.getElementById("socialSection");


// ============================================================
// STORE EMAIL FOR OTP
// ============================================================

let loginEmail = "";


// ============================================================
// LOGIN FORM
// ============================================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Get values

    const email = emailInput.value.trim();

    const password = passwordInput.value;


    // Clear old message

    showMessage(loginMessage, "", false);


    // Disable button

    loginButton.disabled = true;

    loginButton.textContent = "Sending OTP...";


    try {

        // Send email and password to backend

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });


        const data = await response.json();


        // Backend error

        if (!response.ok) {

            showMessage(
                loginMessage,
                data.message || "Login failed.",
                true
            );

            return;
        }


        // Save email

        loginEmail = data.email || email;


        // Show OTP section

        showOtpSection();


    } catch (error) {

        console.error("Login error:", error);

        showMessage(
            loginMessage,
            "Unable to connect to the server.",
            true
        );

    } finally {

        loginButton.disabled = false;

        loginButton.textContent = "Login";

    }

});


// ============================================================
// SHOW OTP SECTION
// ============================================================

function showOtpSection() {

    // Hide login form

    loginForm.classList.add("hidden");


    // Hide social login

    socialSection.classList.add("hidden");


    // Change heading

    loginHeading.innerHTML = `
        <h1
            class="text-3xl
                   sm:text-4xl
                   font-bold
                   text-[#00323F]"
        >
            Verify OTP
        </h1>

        <p
            class="mt-2
                   text-sm
                   text-gray-500"
        >
            Complete your secure admin login
        </p>
    `;


    // Display email

    otpEmail.textContent = loginEmail;


    // Show OTP form

    otpForm.classList.remove("hidden");


    // Focus OTP input

    otpInput.focus();

}


// ============================================================
// OTP FORM
// ============================================================

otpForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Get OTP

    const otp = otpInput.value.trim();


    // Clear old message

    showMessage(otpMessage, "", false);


    // Check OTP length

    if (!/^\d{6}$/.test(otp)) {

        showMessage(
            otpMessage,
            "Please enter a valid 6-digit OTP.",
            true
        );

        return;
    }


    // Disable button

    verifyOtpButton.disabled = true;

    verifyOtpButton.textContent = "Verifying...";


    try {

        // Send OTP to backend

        const response = await fetch("/api/auth/verify-otp", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: loginEmail,
                otp: otp
            })

        });


        const data = await response.json();


        // Backend error

        if (!response.ok) {

            showMessage(
                otpMessage,
                data.message || "Invalid OTP.",
                true
            );

            return;
        }


        // ====================================================
        // OTP SUCCESS
        // ====================================================

        showMessage(
            otpMessage,
            "OTP verified successfully.",
            false
        );


        // Store token temporarily

        localStorage.setItem("token", data.token);


        // Store role

        localStorage.setItem("role", data.role);


        // Go to dashboard

        window.location.href = "/pages/dashboard.html";


    } catch (error) {

        console.error("OTP verification error:", error);

        showMessage(
            otpMessage,
            "Unable to connect to the server.",
            true
        );

    } finally {

        verifyOtpButton.disabled = false;

        verifyOtpButton.textContent = "Verify OTP";

    }

});


// ============================================================
// BACK TO LOGIN
// ============================================================

backToLogin.addEventListener("click", function () {

    // Hide OTP

    otpForm.classList.add("hidden");


    // Show login

    loginForm.classList.remove("hidden");


    // Show social buttons

    socialSection.classList.remove("hidden");


    // Restore heading

    loginHeading.innerHTML = `
        <h1
            class="text-3xl
                   sm:text-4xl
                   font-bold
                   text-[#00323F]"
        >
            Welcome Back
        </h1>

        <p
            class="mt-2
                   text-sm
                   text-gray-500"
        >
            Sign in to your admin account
        </p>
    `;


    // Clear OTP

    otpInput.value = "";


    // Clear messages

    showMessage(otpMessage, "", false);

});


// ============================================================
// ONLY ALLOW NUMBERS IN OTP
// ============================================================

otpInput.addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "");

});


// ============================================================
// MESSAGE FUNCTION
// ============================================================

function showMessage(element, message, isError) {

    if (!message) {

        element.textContent = "";

        element.classList.add("hidden");

        return;
    }


    element.textContent = message;

    element.classList.remove("hidden");


    if (isError) {

        element.classList.remove(
            "text-green-600"
        );

        element.classList.add(
            "text-red-600"
        );

    } else {

        element.classList.remove(
            "text-red-600"
        );

        element.classList.add(
            "text-green-600"
        );

    }

}


// ============================================================
// SOCIAL LOGIN
// ============================================================

document
    .getElementById("googleLogin")
    .addEventListener("click", function () {

        alert("Google login will be implemented later.");

    });


document
    .getElementById("microsoftLogin")
    .addEventListener("click", function () {

        alert("Microsoft login will be implemented later.");

    });


// ============================================================
// FORGOT PASSWORD
// ============================================================

document
    .getElementById("forgotPassword")
    .addEventListener("click", function (event) {

       window.location.href = "forgot-password.html";


    });