import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import catchAsync from "./catchAsync";

cloudinary.config({
  secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const options = {
      use_filename: true,
      unique_filename: true,
      overwrite: true,
    };

    const result = await cloudinary.uploader.upload(localFilePath, options);
    console.log("result", result.url);
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

console.log(cloudinary.config());
