const config = require("../config");
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: config.CLOUDINARY.CLOUD_NAME,
  api_key: config.CLOUDINARY.API_KEY,
  api_secret: config.CLOUDINARY.API_SECRET
});

module.exports = cloudinary;
