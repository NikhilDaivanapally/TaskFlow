import { v2 as cloudinary } from "cloudinary";
import { unlink } from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  filePath: string,
  folder: string = "uploads"
): Promise<string | null> => {
  if (!filePath) return null;

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
      overwrite: true,
    });
    return result.secure_url || null;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  } finally {
    // Cleanup local file
    try {
      await unlink(filePath);
    } catch (cleanupErr) {
      console.warn("Failed to remove temp file:", filePath, cleanupErr);
    }
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
};
