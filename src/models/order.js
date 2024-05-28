const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    shippingInfo: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      zipCode: {
        type: Number,
        required: true,
      },
    },

    user: {
      type: String,
      ref: "User",
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
    },
    discountCode: {
      type: String,
    },
    discount: {
      default: 0,
      type: Number,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },

    orderItems: [
      {
        productBrand: String,
        productCategory: String,
        productColo: String,
        productId: String,
        productImage: String,
        productName: String,
        productPrice: Number,
        productSize: String,
        productStock: Number,
        quantity: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
