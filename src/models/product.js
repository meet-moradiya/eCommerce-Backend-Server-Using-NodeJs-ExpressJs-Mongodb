const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    categories: {
      type: String,
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bulletPoints: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    madeIn: {
      type: String,
      required: true,
    },
    modelNo: {
      type: String,
      required: true,
    },
    mainImage: {
      type: String,
      required: true,
    },
    otherImages: {
      type: [String],
    },
    warranty: {
      type: String,
    },
    material: {
      type: String,
    },
    color: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
