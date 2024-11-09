import express from "express";

import { upload } from "../middleware/multer.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { addProduct, deleteProduct, getAllBrands, getAllCategories, getAllProducts, getProductsByBrand, getProductsByCategory, getSingleProduct, updateProduct } from "../controller/product.controller.js";
const productRouter = express.Router();

productRouter.post("/add", upload.single("product_image"), authMiddleware, addProduct);
productRouter.put("/update/:id", authMiddleware, updateProduct);
productRouter.get("/all", authMiddleware, getAllProducts);
productRouter.get("/brand", authMiddleware, getAllBrands);
productRouter.get("/brand/:brand", authMiddleware, getProductsByBrand);
productRouter.get("/category", authMiddleware, getAllCategories);
productRouter.get("/category/:category", authMiddleware, getProductsByCategory);
productRouter.get("/product/:id", authMiddleware, getSingleProduct);
productRouter.delete("/delete/:id", authMiddleware, deleteProduct);

export default productRouter;