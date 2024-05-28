const Review = require("../models/review");
const Product = require("../models/product");
const Order = require("../models/order");

// create review
exports.createReview = async (req, res) => {
  const { productId, user, productRating, productReview } = req.body;

  // Check if all required fields are provided
  if (!productId || !user || !productRating || !productReview) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: Rating & Review.",
    });
  }

  // Check if product exists
  const reviewedProduct = await Product.findById(productId);
  if (!reviewedProduct) {
    return res.status(400).json({
      success: false,
      message: "Product not found",
    });
  }

  try {
    // Check if the user has ordered the product before
    const userOrders = await Order.find({ user: user, "orderItems.productId": productId, status: "Delivered" });
    if (userOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "We apologize but you have not met the minimum eligibility requirements to write a review.",
      });
    }

    // Create Review
    const review = await Review.create({ productId, user, productRating, productReview });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the review.",
      error: error.message,
    });
  }
};

// get single review
exports.getSingleReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;

    const singleReview = await Review.findById(reviewId);

    if (!singleReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      singleReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get all review
exports.getAllReview = async (req, res) => {
  try {
    const { id: productId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    // Retrieve all reviews for the product with pagination
    const allProductReview = await Review.find({ productId }).populate("user", ["name", "avatar"]).sort({ createdAt: -1 }).limit(limit).skip(skip);

    if (allProductReview.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Be the first to review this Product",
        totalReviews: 0,
        averageRating: 0,
        totalPages: 0,
        starPercentages: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      });
    }

    // Calculate the sum of ratings
    const sumOfRatings = allProductReview.reduce((total, review) => total + review.productRating, 0);

    // Calculate the average rating
    const averageRating = (sumOfRatings / allProductReview.length).toFixed(2);

    // Calculate the total number of reviews
    const totalReviews = await Review.countDocuments({ productId });

    // Calculate the total count of each star rating globally
    const starCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    const allReviews = await Review.find({ productId });
    allReviews.forEach((review) => {
      starCounts[review.productRating.toString()]++;
    });

    // Calculate the percentage of each star rating globally
    const starPercentages = {};
    for (const [key, value] of Object.entries(starCounts)) {
      starPercentages[key] = ((value / totalReviews) * 100).toFixed(2);
    }

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalReviews / limit);

    return res.status(200).json({
      success: true,
      averageRating,
      totalReviews,
      totalPages,
      allProductReview,
      starCounts,
      starPercentages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// update review
exports.updateReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;

    const singleReview = await Review.findById(reviewId);
    if (!singleReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Extract product details from request body
    const { productRating, productReview } = req.body;

    // Update product details if provided
    if (productRating) singleReview.productRating = productRating;
    if (productReview) singleReview.productReview = productReview;

    // Save updated review
    const updatedReview = await singleReview.save();

    return res.status(200).json({ success: true, updatedReview, message: "Review updated successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, error, message: "Something went wrong." });
  }
};

// delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;

    const singleReview = await Review.findById(reviewId);
    if (!singleReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Delete the product from the database
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    return res.status(201).send({ success: true, message: "Review Deleted", deletedReview });
  } catch (error) {
    return res.status(400).send({ error, message: "Something went wrong." });
  }
};
