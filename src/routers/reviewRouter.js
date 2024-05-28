const express = require("express");
const reviewController = require("../controllers/reviewController");
const adminOnly = require("../middlewares/userAuth");

const router = express.Router();

// route - /api/v1/review/new
router.post("/new", reviewController.createReview);

// route - /api/v1/review/all
router.get("/all", reviewController.getAllReview);

// route - /api/v1/review/single
router.get("/:id", reviewController.getSingleReview);

// route - /api/v1/review/:id
router.put("/:id", reviewController.updateReview);

// route - /api/v1/review/:id (admin only)
router.delete("/:id", adminOnly, reviewController.deleteReview);

module.exports = router;
