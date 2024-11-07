import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config()
const authMiddleware = async (req, res, next) => {
	try {
		if (!req.headers.authorization) {
			return res.status(401).json({
				message: `Unauthorized access! No authorization header found!!!`,
				success: false
			});
		}
		const token = req.headers.authorization.split(" ")[1];
		if (!token) {
			return res.status(401).json({
				message: `Unauthorized access! No token provided!!!`,
				success: false
			});
		}
		jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
			if (error) {
				return res.status(401).json({
					message: `Invalid token, Unable to verify!!!, Error: ${error}`,
					success: false
				});
			}
			req.user = decoded;
			next();
		})
	} catch (error) {
		return res.status(502).json({
			message: `Error while verifying the token: ${error.message}`,
			success: false
		})
	}
}

export default authMiddleware;