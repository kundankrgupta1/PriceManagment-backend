import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
	product_image: {
		type: String,
		required: true
	},
	product: {
		type: String,
		required: true,
		trim: true
	},
	brand: {
		type: String,
		required: true,
		trim: true,
	},
	category: {
		type: String,
		required: true,
		trim: true
	},
	box_qty: {
		type: Number,
		default: 0,
		required: true
	},
	single_price: {
		type: Number,
		default: 0,
		required: true,
		trim: true
	},
	priceHistory: [
		{
			price: {
				type: Number,
				default: 0
			},
			createdAt: {
				type: Date,
				default: Date.now
			}
		}
	],
	box_price: {
		type: Number,
		default: 0,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

const productModel = mongoose.model("Product", productSchema);

export default productModel;
