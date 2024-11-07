import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"
dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

const uploadOnCloudinary = async (filePath) => {
	try {
		if (!filePath) {
			return null
		}
		const response = await cloudinary.uploader.upload(filePath, {
			resource_type: "auto",
			folder: "posts",
			width: 1080,
			height: 1350,
			quality: "auto"
		})
		fs.unlinkSync(filePath);
		return response
	} catch (error) {
		fs.unlinkSync(filePath)
		return null
	}
}

export default uploadOnCloudinary;
