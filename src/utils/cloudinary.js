import { v2 as cloudinary } from "cloudinary";
import { fs, unlinkSync } from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload the file in cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully

    console.log("file is uploaded on cloudinary", uploadResult.url);

    return uploadResult;
  } catch (err) {
    // remove the locally saved temporary file from sever which is not uploaded or got failed in cloudinary
    fs.unlinkSync(localFilePath);
    return null;
  }
};



export {uploadOnCloudinary}