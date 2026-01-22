import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({});

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export const uploadMediatoCloudinary = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return uploadResponse;
  } catch (error) {
    console.log("Error in uploading media to cloudinary");
    console.log(error);
  }
};

export const deleteMediafromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return res.status(200).json({
      message: "File successfully deleted from cloudinary",
    });
  } catch (error) {
    console.log("Error in deleting media from cloudinary");
    console.log(error);
  }
};

export const deleteVideofromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    return res.status(200).json({
      message: "File successfully deleted from cloudinary",
    });
  } catch (error) {
    console.log("Error in deleting media from cloudinary");
    console.log(error);
  }
};
