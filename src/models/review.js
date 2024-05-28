const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    productRating: {
      type: Number,
      required: true,
    },
    productReview: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
