import express from "express";
import userRoutes from "../routes/user.route.js";
import productRouter from "../routes/product.route.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors())
app.use(userRoutes);
app.use(productRouter)
export default app;