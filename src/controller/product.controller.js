import productModel from "../model/product.model.js";
import userModel from "../model/user.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";

export const addProduct = async (req, res) => {
	const { product_image, product, brand, category, box_qty, single_price } = req.body;
	const { userId } = req.user;

	try {
		const user = await userModel.findById(userId);

		if (!user) {
			return res.status(401).json({
				message: "❌ Unauthorized Access",
				success: false
			});
		}

		if (!product || !brand || !category || !box_qty || !single_price) {
			return res.status(400).json({
				message: "❌ Please fill all the fields",
				success: false
			});
		}

		const filePath = req.file?.path;
		if (!filePath) {
			return res.status(400).json({
				message: "🖼️ File is required",
				success: false
			});
		}

		const cloudinaryURL = await uploadOnCloudinary(filePath);
		if (!cloudinaryURL?.url) {
			return res.status(500).json({
				message: "🖼️ File upload failed, URL not found",
				success: false
			});
		}
		const newProduct = new productModel({
			product_image: cloudinaryURL.url,
			product,
			brand,
			category,
			single_price,
			box_qty,
			box_price: single_price * box_qty
		});

		await newProduct.save();

		return res.status(201).json({
			message: "✅ Product added successfully",
			success: true
		});

	} catch (error) {
		return res.status(500).json({
			message: error.message,
			success: false
		});
	}
};

export const updateProduct = async (req, res) => {
	const { userId } = req.user;
	const { id } = req.params;
	const { newPrice } = req.body;

	try {
		if (!userId) {
			return res.status(401).json({
				message: "❌ Unauthorized Access",
				success: false
			});
		}

		const product = await productModel.findById(id);
		if (!product) {
			return res.status(404).json({
				message: "🚫 Product not found",
				success: false
			});
		}

		if (newPrice && product.single_price !== newPrice) {
			product.priceHistory.push({
				price: product.single_price,
				createdAt: product.createdAt
			});
			product.single_price = newPrice;
			product.box_price = newPrice * product.box_qty;
			product.createdAt = Date.now();
		}

		product.updatedAt = new Date();

		await product.save();

		return res.status(200).json({
			message: "✅ Product updated successfully",
			product,
			success: true
		});

	} catch (error) {
		return res.status(500).json({
			message: "❌ Error updating product",
			error: error.message,
			success: false
		});
	}
};

export const deleteProduct = async (req, res) => {
	const { id } = req.params;
	const { userId } = req.user;
	try {
		if (!userId) {
			return res.status(401).json({
				message: "❌ Unauthorized Access",
				success: false
			})
		}
		const product = await productModel.findByIdAndDelete(id);
		if (!product) {
			return res.status(404).json({
				message: "🚫 Product not found",
				success: false
			})
		}
		return res.status(200).json({
			message: "✅ Product deleted successfully",
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			message: "❌ Error deleting product",
			error: error.message,
			success: false
		});
	}
}

export const getAllProducts = async (req, res) => {
	try {
		const { q, category, brand } = req.query;
		const query = {};
		if (q) {
			query.$or = [
				{ product: { $regex: q, $options: 'i' } },
				{ brand: { $regex: q, $options: 'i' } },
			]
		}
		if (category) {
			query.category = category
		}

		if (brand) {
			query.brand = brand
		}

		const products = await productModel.find(query);
		return res.status(200).json({
			message: "✅ All Products fetched successfully",
			products,
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			message: `❌ Error: ${error.message}`,
			success: false
		});
	}
};

export const getAllBrands = async (req, res) => {
	try {
		const brands = await productModel.distinct("brand");
		return res.status(200).json({
			message: "✅ Brands fetched successfully",
			brands,
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			message: `❌ ${error.message}`,
			success: false
		});
	}
};

export const getProductsByBrand = async (req, res) => {
	const { userId } = req.user;
	const { brand } = req.params;
	try {
		if (!userId) {
			return res.status(401).json({
				message: "❌ Unauthorized Access",
				success: false
			});
		}
		const products = await productModel.find({ brand });
		console.log(products);
		return res.status(200).json({
			message: "✅ Products by brand fetched successfully",
			products,
			success: true
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: `❌ ${error.message}`,
			success: false
		});
	}
};

export const getAllCategories = async (req, res) => {
	const { userId } = req.user;
	try {
		if (!userId) {
			return res.status(401).json({
				message: "❌ Unauthorized Access",
				success: false
			});
		}

		const categories = await productModel.distinct("category");

		return res.status(200).json({
			message: "✅ Categories fetched successfully",
			categories,
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			message: `❌ ${error.message}`,
			success: false
		});
	}
}

export const getProductsByCategory = async (req, res) => {
	const { userId } = req.user;
	const { category } = req.params;
	try {
		if (!userId) {
			return res.status(401).json({
				message: "❌ Unauthorized Access",
				success: false
			});
		}
		const products = await productModel.find({ category });
		return res.status(200).json({
			message: "✅ Products fetched successfully",
			products,
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			message: `❌ ${error.message}`,
			success: false
		});
	}
}

export const getSingleProduct = async (req, res) => {
	const { userId } = req.user;
	const { id } = req.params;
	try {
		if (!userId) {
			return res.status(401).json({
				message: "❌ Unauthorized Access",
				success: false
			});
		}
		const product = await productModel.findById(id);
		if (!product) {
			return res.status(200).json({
				message: "❌ Product not found!!",
				success: false
			});
		}
		return res.status(200).json({
			message: "✅ Product fetched successfully",
			product,
			success: true
		});
	} catch (error) {
		return res.status(500).json({
			message: `❌ ${error.message}`,
			success: false
		});
	}
}