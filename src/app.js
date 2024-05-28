const express = require("express");
const mongoose = require("mongoose");
const { config } = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

// router importing
const userRouter = require("./routers/userRouter");
const productRouter = require("./routers/productRouter");
const orderRouter = require("./routers/orderRouter");
const paymentRouter = require("./routers/paymentRouter");
const dashboardRouter = require("./routers/statsRouter");
const reviewRouter = require("./routers/reviewRouter");

config({
  path: "./.env",
});

const app = express();
const PORT = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    dbName: "ecommerceBackend",
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Routes

app.get("/", (req, res) => {
  res.send("Server start.");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/review", reviewRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ##################################################################

// const express = require("express");
// const mongoose = require("mongoose");
// const { config } = require("dotenv");
// const { default: Stripe } = require("stripe");
// const cors = require("cors");
// const morgan = require("morgan");

// // router importing
// const userRouter = require("./routers/userRouter");
// const productRouter = require("./routers/productRouter");
// const orderRouter = require("./routers/orderRouter");
// const paymentRouter = require("./routers/paymentRouter");
// const dashboardRouter = require("./routers/statsRouter");
// const reviewRouter = require("./routers/reviewRouter");

// config({
//   path: "./.env",
// });

// const app = express();
// const PORT = process.env.PORT || 4000;
// const mongoURI = process.env.MONGO_URI || "";
// const stripeKEY = process.env.STRIPE_KEY || "";

// // Connect to MongoDB
// mongoose
//   .connect(mongoURI, {
//     dbName: "ecommerceBackend",
//   })
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((error) => {
//     console.error("MongoDB connection error:", error);
//   });

// // connect to the stripe
// const stripe = new Stripe(stripeKEY);

// // Middleware
// app.use(express.json());
// app.use(morgan("dev"));
// app.use(cors());

// // Routes

// app.get("/", (req, res) => {
//   res.send("Server start.");
// });

// app.use("/api/v1/user", userRouter);
// app.use("/api/v1/product", productRouter);
// app.use("/api/v1/order", orderRouter);
// app.use("/api/v1/payment", paymentRouter);
// app.use("/api/v1/dashboard", dashboardRouter);
// app.use("/api/v1/review", reviewRouter);

// // creating payment router with stripe
// app.use("/api/v1/payment/create", async (req, res) => {
//   const { amount } = req.body;

//   if (!amount)
//     return res.status(400).json({
//       success: false,
//       message: "Please enter Amount.",
//     });

//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: Number(amount) * 100,
//     currency: "inr",
//   });

//   console.log(paymentIntent.client_secret);

//   return res.status(200).json({
//     success: true,
//     clientSecrate: paymentIntent.client_secret,
//     amount,
//   });
// });

// app.use("/uploads", express.static("uploads"));

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
