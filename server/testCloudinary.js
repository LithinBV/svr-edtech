require("dotenv").config();

const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

cloudinary.uploader.upload(
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    {
        folder: "svr-edtech/test"
    },
    (error, result) => {
        if (error) {
            console.error("CLOUDINARY TEST FAILED:");
            console.error(error);
            return;
        }

        console.log("CLOUDINARY TEST SUCCESS:");
        console.log(result.secure_url);
    }
);