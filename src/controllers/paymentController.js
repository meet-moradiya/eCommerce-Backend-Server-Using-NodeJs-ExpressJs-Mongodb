const Coupon = require("../models/coupon");

// create new coupon
exports.createCoupon = async (req, res) => {
  const { couponCode, couponAmount, expireDate, maxUsage } = req.body;

  // Check if all required fields are provided
  if (!couponCode || !couponAmount || !expireDate || !maxUsage) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: couponCode, couponAmount, expireDate, maxUsage.",
    });
  }

  try {
    // Create the coupon
    await Coupon.create({ couponCode, couponAmount, expireDate, maxUsage });

    return res.status(201).json({
      success: true,
      message: `Coupon ${couponCode} with ${couponAmount} Discount Created.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the coupon.",
      error: error.message,
    });
  }
};

// discount amount
exports.applyDiscount = async (req, res) => {
  const { couponCode } = req.query;

  try {
    // Find the coupon by couponCode
    const discount = await Coupon.findOne({ couponCode });

    // If no coupon found with the provided code
    if (!discount) {
      return res.status(400).json({
        success: false,
        message: "Invalid Coupon",
      });
    }

    // Check if the coupon has expired
    const currentDate = new Date();
    if (currentDate > discount.expireDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon Expired",
      });
    }

    // Check if the maximum usage limit has been reached
    if (discount.usedCount >= discount.maxUsage) {
      return res.status(400).json({
        success: false,
        message: "Maximum usage limit reached for this coupon",
      });
    }

    // If the coupon is still valid and within the usage limit, return the discount amount
    return res.status(200).json({
      success: true,
      discount: discount.couponAmount,
      message: `Discount of ${discount.couponAmount} applied`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while applying the discount.",
      error: error.message,
    });
  }
};

// Update coupon usage upon successful payment
exports.updateCouponUsage = async (req, res) => {
  const { couponCode } = req.body;

  try {
    // Find the coupon by couponCode
    const coupon = await Coupon.findOne({ couponCode });

    // If no coupon found with the provided code
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid Coupon",
      });
    }

    // Update the usedCount of the coupon
    coupon.usedCount += 1;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon usage updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating coupon usage.",
      error: error.message,
    });
  }
};

// get all coupons
exports.allCoupons = async (req, res) => {
  const allCoupons = await Coupon.find();
  if (allCoupons.length === 0) {
    return res.status(201).json({
      success: true,
      message: "There is no coupon available.",
    });
  }
  return res.status(201).json({
    success: true,
    allCoupons,
  });
};

// delete coupon
exports.deleteCoupon = async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    return res.status(400).json({
      success: false,
      message: "Coupon not Found.",
    });
  }

  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon.couponCode} with ${coupon.couponAmount} Ammount deleted successfully.`,
  });
};
