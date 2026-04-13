import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { extractPublicId } from "./extractPublicId";

cloudinary.config({
  secure: true,
});

export const uploadOnCloudinary = async (
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
      transformation: [
        { width: 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    };

    const result = await cloudinary.uploader.upload(localFilePath, options);

    fs.unlinkSync(localFilePath);
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteFromCloudinary = async (
  imageUrl: string,
): Promise<boolean> => {
  try {
    const publicId = extractPublicId(imageUrl);

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("result", result);
    return result.result === "ok";
  } catch (error) {
    return false;
  }
};

export const deleteManyFromCloudinary = async (
  imageUrls: string[],
): Promise<void> => {
  await Promise.all(imageUrls.map((url) => deleteFromCloudinary(url)));
};
