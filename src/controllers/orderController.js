const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");
const uuid = require("uuid");

// new order
exports.newOrder = async (req, res) => {
  try {
    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, discountCode, total, status } = req.body;

    // Validate required fields
    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !shippingCharges || !total) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    const orderId = uuid.v4();

    // Create new order
    const newOrder = await Order.create({
      _id: orderId,
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      discountCode,
      total,
      status,
    });

    // Update product stock
    for (let i = 0; i < orderItems.length; i++) {
      const orderItem = orderItems[i];
      const product = await Product.findById(orderItem.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found.",
        });
      }
      product.stock -= orderItem.quantity;
      await product.save();
    }

    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// my order
exports.myOrder = async (req, res) => {
  try {
    const { id: user } = req.query;

    // Check if user is provided and valid
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User ID is missing.",
      });
    }

    // Check if the user exists
    const userExists = await User.exists({ _id: user });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User does not exist.",
      });
    }

    const orders = await Order.find({ user }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Looks like your cart is craving some goodies! Time to fill it up!",
      });
    } else {
      return res.status(200).json({
        success: true,
        orders,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// all order
exports.allOrder = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", ["name", "email", "phone"]).sort({ createdAt: -1 }); //here we use .populate for getting user information from database
    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        orders,
        message: "Oh dear! Your shipping dashboard is as deserted as a ghost town. Let's bring in some order traffic!",
      });
    } else {
      return res.status(200).json({
        success: true,
        orders,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// single order
exports.singleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const singleOrder = await Order.findById(id).populate("user", ["name", "email", "phone"]);

    if (!singleOrder) {
      return res.status(200).json({
        success: true,
        message: "Invalid Order ID.",
      });
    } else {
      return res.status(200).json({
        success: true,
        singleOrder,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Process order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(200).json({
        success: true,
        message: "Order not Found.",
      });
    }
    if (order.status === "Processing") {
      order.status = "Shipped";
    } else if (order.status === "Shipped") {
      order.status = "Delivered";
    } else {
      order.status = "Delivered";
    }

    await order.save();
    return res.status(201).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(200).json({
        success: true,
        message: "Order not Found.",
      });
    }

    await Order.findByIdAndDelete(id);
    return res.status(201).json({
      success: true,
      message: "Order deleted.",
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
