const express = require("express");
const adminOnly = require("../middlewares/userAuth.js");
const orderController = require("../controllers/orderController.js");

const router = express.Router();

// Create New Product - /api/v1/order/new
router.post("/new", orderController.newOrder);

// My order - /api/v1/order/my-order
router.get("/my-order", orderController.myOrder);

// All order - /api/v1/order/all
router.get("/all", adminOnly, orderController.allOrder);

// Single order - /api/v1/order/:id
router.get("/:id", orderController.singleOrder);

// Update order Status - /api/v1/order/:id (admin only)
router.put("/:id", adminOnly, orderController.updateOrderStatus);

// Update order Status - /api/v1/order/:id (admin only)
router.delete("/:id", adminOnly, orderController.deleteOrder);

module.exports = router;
