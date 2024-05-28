const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
    },
    couponAmount: {
      type: Number,
      required: true,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    maxUsage: {
      type: Number,
      required: true,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
