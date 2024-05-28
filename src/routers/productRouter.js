const express = require("express");
const adminOnly = require("../middlewares/userAuth.js");
const productController = require("../controllers/productController.js");
const upload = require("../middlewares/multer.js");

const router = express.Router();

// Create New Product - /api/v1/product/new
router.post(
  "/new",
  adminOnly,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "otherImages", maxCount: 5 },
  ]),
  productController.newProduct
);

// Get All Products with Filters - /api/v1/product/all
router.get("/all", productController.getAllProducts);

// Get Last 10 Products - /api/v1/product/latest
router.get("/latest", productController.getlatestProducts);

// Get All Unique Categories - /api/v1/product/categories
router.get("/categories", productController.getAllCategories);

// Get All Products (accessible only to admins) - /api/v1/product/admin-products
router.get("/admin-products", adminOnly, productController.getAdminProducts);

// Get, Update, Delete Product
router
  .route("/:id")
  .get(productController.getSingleProduct)
  .put(
    adminOnly,
    upload.fields([
      { name: "mainImage", maxCount: 1 },
      { name: "otherImages", maxCount: 5 },
    ]),
    productController.updateProduct
  )
  .delete(adminOnly, productController.deleteProduct);

module.exports = router;
