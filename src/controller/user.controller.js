import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import sendEmail from "../utils/mailer.js";
import userModel from "../model/user.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";
import generateOTP from "../utils/generateOTP.js";
dotenv.config();


const sendOtp = async (email, otp, purpose) => {
	await sendEmail.sendMail({
		to: email,
		subject: `otp for ${purpose}`,
		text: `otp send to your email for ${purpose} is ${otp}`,
	})
}


const userRegistration = async (req, res) => {

	const { profilePicture, name, email, password } = req.body;

	try {
		if (!name || !email && !password) {
			return res.status(400).json({
				message: "❌ ALl filed are required!!!!",
				success: false
			})
		}

		const user = await userModel.findOne({ email });

		if (user && user.isVerified) {
			return res.status(409).json({
				message: "❌ User already exist and verified!, Please Login",
				success: false
			})
		}

		if (user && !user.isVerified) {
			const otp = generateOTP();
			const otp_expiry = Date.now() + 2 * 60 * 1000;

			user.otp = otp;
			user.otp_expiry = otp_expiry;
			user.otpPurpose = "Verification";
			user.isVerified = false;

			await sendOtp(email, otp, "Verification")

			await user.save();

			return res.status(202).json({
				message: `✅ OTP sent for verification`,
				success: true,
			})
		}

		const filePath = req.file?.path;

		if (!filePath) {
			return res.status(501).json({
				message: "🖼️ Profile picture is required",
				success: false
			})
		}

		const cloudinaryURL = await uploadOnCloudinary(filePath);

		if (!cloudinaryURL?.url) {
			return res.status(501).json({
				message: "🖼️ Profile picture is required",
				success: false
			})
		}

		const otp = generateOTP();
		const otp_expiry = Date.now() + 2 * 60 * 1000;

		const hashPass = await bcrypt.hash(password, 10);

		const newUser = new userModel({
			name,
			email,
			password: hashPass,
			profilePicture: cloudinaryURL.url,
			otp,
			otp_expiry,
			otpPurpose: "Registration",
			isVerified: false
		});

		await sendOtp(email, otp, "Registration")

		await newUser.save();

		return res.status(201).json({
			message: `✅ OTP sent for Registration`,
			success: true,
		})

	} catch (error) {
		return res.status(500).json({
			message: `❌ Error: ${error.message}`,
			success: false
		})
	}
}

const userLogin = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			message: "❌ All fields are required!!!",
			success: false
		})
	}

	try {
		const user = await userModel.findOne({ email });
		if (!user) {
			return res.status(404).json({
				message: "🚫 User not found, Please register first!!!",
				success: false
			})
		}

		const checkPass = await bcrypt.compare(password, user.password);

		if (!checkPass) {
			return res.status(401).json({
				message: `❌ Invalid Email or Password`,
				success: false
			})
		}

		if (!user.isVerified) {
			const otp = generateOTP();
			const otp_expiry = Date.now() + 2 * 60 * 1000;
			user.otp = otp;
			user.otp_expiry = otp_expiry;
			user.otpPurpose = "Verification";
			user.isVerified = false

			await sendOtp(email, otp, "Verification")

			await user.save();

			return res.status(202).json({
				message: `✅ OTP sent for Verification`,
				success: true,
			})
		}


		const otp = generateOTP();
		const otp_expiry = Date.now() + 2 * 60 * 1000;

		user.otp = otp;
		user.otp_expiry = otp_expiry;
		user.otpPurpose = "Login";

		await sendOtp(email, otp, "Login")

		await user.save();

		return res.status(202).json({
			message: `✅ OTP sent for Login`,
			success: true
		})

	} catch (error) {
		return res.status(500).json({
			message: `❌ Error: ${error.message}`,
			success: false
		})
	}
}

const verifyOtp = async (req, res) => {
	const { email, otp } = req.body;
	try {
		const user = await userModel.findOne({ email });

		if (!user) {
			return res.status(404).json({
				message: "❌ User not found, please register first!",
				success: false
			})
		}

		if (user.otp !== otp) {
			return res.status(401).json({
				message: "❌ Invalid or Expired OTP",
				success: false
			})
		}

		if (Date.now() > user.otp_expiry) {
			return res.status(401).json({
				message: "❌ OTP Expired!",
				success: false
			})
		}

		const otpPurpose = user.otpPurpose;

		user.isVerified = true;
		user.otp = undefined;
		user.otp_expiry = undefined;
		user.otpPurpose = undefined;

		let token;
		if (otpPurpose === "Login") {
			token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
		}

		await user.save();

		return res.status(200).json({
			message: `✅ ${otpPurpose} success!`,
			success: true,
			loginRequired: otpPurpose === "Login" ? undefined : true,
			token: otpPurpose === "Login" ? token : undefined,
			user: otpPurpose === "Login" ? { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture } : undefined
		})

	} catch (error) {
		return res.status(500).json({
			message: `❌ Error: ${error.message}`,
			success: false
		})
	}
}

const getUser = async (req, res) => {
	const { userId } = req.params;
	const { email } = req.body;
	try {
		const user = await userModel.findById(userId);
		console.log("getUser", user)
		if (user.email !== email) {
			return res.status(404).json({
				message: `❌ User not found!`,
				success: false
			})
		}

		return res.status(200).json({
			message: `✅ User found Successfully!`,
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				profilePicture: user.profilePicture,
				isVerified: user.isVerified,
			}
		})
	} catch (error) {
		return res.status(500).json({
			message: `❌ Error: ${error.message}`,
			success: false
		})
	}
}

export { userRegistration, userLogin, verifyOtp, getUser };