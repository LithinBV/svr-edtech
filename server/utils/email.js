const nodemailer = require("nodemailer");


// ===============================
// CREATE EMAIL TRANSPORTER
// ===============================

const transporter = nodemailer.createTransport({

    host: process.env.SMTP_HOST,

    port: Number(process.env.SMTP_PORT),

    secure: true,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }

});


// ===============================
// LOGIN OTP EMAIL
// ===============================

const sendOTPEmail = async (email, otp) => {

    await transporter.sendMail({

        from: `"SVR EDTECH Admin" <${process.env.SMTP_USER}>`,

        to: email,

        subject: "SVR EDTECH Admin Login OTP",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
            ">

                <h2>SVR EDTECH Admin Login</h2>

                <p>
                    Your verification OTP is:
                </p>

                <h1 style="
                    letter-spacing: 8px;
                    font-size: 32px;
                ">
                    ${otp}
                </h1>

                <p>
                    This OTP will expire in 5 minutes.
                </p>

                <p>
                    If you did not request this OTP,
                    please ignore this email.
                </p>

            </div>
        `
    });

};


// ===============================
// PASSWORD RESET OTP EMAIL
// ===============================

const sendPasswordResetOTPEmail = async (email, otp) => {

    await transporter.sendMail({

        from: `"SVR EDTECH Admin" <${process.env.SMTP_USER}>`,

        to: email,

        subject: "SVR EDTECH Password Reset OTP",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
            ">

                <h2>SVR EDTECH Password Reset</h2>

                <p>
                    We received a request to reset your
                    admin account password.
                </p>

                <p>
                    Your verification OTP is:
                </p>

                <h1 style="
                    letter-spacing: 8px;
                    font-size: 32px;
                ">
                    ${otp}
                </h1>

                <p>
                    This OTP will expire in 5 minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    please ignore this email.
                </p>

            </div>
        `
    });

};


module.exports = {
    sendOTPEmail,
    sendPasswordResetOTPEmail
};