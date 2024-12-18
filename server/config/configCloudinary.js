// cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary's ES module version

// You can securely store your credentials in environment variables (e.g., .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,      // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET // Your Cloudinary API secret
});

export default cloudinary;
