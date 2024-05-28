const express = require("express");
const adminOnly = require("../middlewares/userAuth");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

// route - /api/v1/payment/coupon/new
router.post("/coupon/new", adminOnly, paymentController.createCoupon);

// route - /api/v1/payment/discount
router.get("/discount", paymentController.applyDiscount);

// route - /api/v1/payment/coupon/update-usage
router.post("/coupon/update-usage", paymentController.updateCouponUsage);

// route - /api/v1/payment/coupon/all
router.get("/coupon/all", adminOnly, paymentController.allCoupons);

// route - /api/v1/payment/coupon/:id
router.delete("/coupon/:id", adminOnly, paymentController.deleteCoupon);

module.exports = router;
