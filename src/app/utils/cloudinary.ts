import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  secure: true,
});

const uploadOnCloudinary = async (
  localFilePath: string,
  folderName: string,
): Promise<string | null> => {
  if (!localFilePath) return null;

  try {
    const options = {
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      folder: folderName,
    };

    const result = await cloudinary.uploader.upload(localFilePath, options);

    fs.unlinkSync(localFilePath);
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export default uploadOnCloudinary;
