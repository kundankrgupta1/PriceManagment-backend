import express from "express";
import { getUser, userLogin, userRegistration, verifyOtp } from "../controller/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const userRoutes = express.Router();

userRoutes.post("/reg", upload.single("profilePicture"), userRegistration)
userRoutes.post("/login", userLogin)
userRoutes.post("/otp", verifyOtp)
userRoutes.get("/user/:userId", authMiddleware, getUser);

export default userRoutes;
