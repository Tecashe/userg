import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import ai from "../../config/ai.js";
import axios from "axios";

export const uploadImages = async (files: Express.Multer.File[]) => {
  return Promise.all(
    files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "image",
      });

      if (!result.secure_url) {
        throw new Error("Cloudinary upload failed");
      }
      return result.secure_url;
    }),
  );
};

export const downloadVideoLocally = async (file: string, userId: string) => {
  const fileName = `${userId}-${Date.now()}.mp4`;
  // Use OS temp directory — required for read-only filesystems (e.g. Vercel)
  const filePath = path.join("/tmp", fileName);

  const response = await axios({
    url: file,
    method: "GET",
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return filePath;
};

export const uploadVideoToCloudinary = async (filePath: string) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
  });

  if (!result.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return result.secure_url;
};

export const cleanupLocalFile = async (filePath: string) => {
  if (filePath && fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
};
