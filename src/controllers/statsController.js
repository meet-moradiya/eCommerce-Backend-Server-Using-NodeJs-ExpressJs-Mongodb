const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Coupon = require("../models/coupon");
const calaulatePercentage = require("../utils/calculateFunc");

// normal data
exports.getDashboardStats = async (req, res) => {
  let stats;

  // Logic for dates and months for stats data
  const today = new Date();

  // Six months ago's month
  function getSixMonthsAgo() {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() - 7;

    // Adjust if month is negative
    if (month < 0) {
      year--;
      month = 12 + month;
    }

    const sixMonthsAgo = new Date(year, month, 1);
    return sixMonthsAgo;
  }

  const sixMonthAgo = getSixMonthsAgo();

  // This will give current month till current date
  const thisMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: today,
  };

  // Logic for checking the previous month
  let previousMonth;
  const currentMonth = today.getMonth();
  if (currentMonth === 0) {
    previousMonth = 12;
  } else {
    previousMonth = currentMonth - 1;
  }

  // This will give the last month with starting and ending date
  const lastMonth = {
    start: new Date(today.getFullYear(), previousMonth, 1),
    end: new Date(today.getFullYear(), today.getMonth(), 0),
  };

  // Now our actual code starts for stats

  // Getting current month and last month products, users, and orders
  const [
    thisMonthProducts,
    lastMonthProducts,
    thisMonthUsers,
    lastMonthUsers,
    thisMonthOrders,
    lastMonthOrders,
    totalProducts,
    totalUsers,
    totalOrders,
    lastSixMonthOrders,
    productCategories,
    latestOrders,
  ] = await Promise.all([
    Product.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
    Product.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
    User.find({ role: "user", createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
    User.find({ role: "user", createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
    Order.find({ createdAt: { $gte: thisMonth.start, $lte: thisMonth.end } }),
    Order.find({ createdAt: { $gte: lastMonth.start, $lte: lastMonth.end } }),
    Product.countDocuments(),
    User.countDocuments({ role: "user" }),
    Order.find({}).select("total"),
    Order.find({ createdAt: { $gte: sixMonthAgo, $lte: today } }),
    Product.distinct("categories"),
    Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(10).sort({ createdAt: -1 }),
  ]);

  // Calculating change percent of all
  const thisMonthUserCount = thisMonthUsers.length;
  const lastMonthUserCount = lastMonthUsers.length;

  const changePercent = {
    revenue: calaulatePercentage(
      thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0),
      lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0)
    ),
    user: calaulatePercentage(thisMonthUserCount, lastMonthUserCount),
    product: calaulatePercentage(thisMonthProducts.length, lastMonthProducts.length),
    order: calaulatePercentage(thisMonthOrders.length, lastMonthOrders.length),
  };

  // Calculating count of all
  const count = {
    revenue: totalOrders.reduce((total, order) => total + (order.total || 0), 0),
    user: totalUsers,
    product: totalProducts,
    order: totalOrders.length,
  };

  // Calculating past seven months data (transactions, orders)
  const monthlyOrderCount = new Array(7).fill(0);
  const monthlyUserCount = new Array(7).fill(0);

  // Initialize sets to store distinct user IDs for each month
  const userSets = Array(7)
    .fill()
    .map(() => new Set());

  // Counting orders and users for each month in the last six months
  lastSixMonthOrders.forEach((order) => {
    const creationDate = order.createdAt;
    const monthDiff = today.getMonth() - creationDate.getMonth();

    if (monthDiff < 7) {
      monthlyOrderCount[7 - monthDiff - 1] += 1;

      // Add the user ID of the order to the corresponding month's set
      userSets[7 - monthDiff - 1].add(order.user);
    }
  });

  // Calculate the number of distinct users for each month
  for (let i = 0; i < userSets.length; i++) {
    monthlyUserCount[i] = userSets[i].size;
  }

  // Calculating all categories percentages
  const categoriesCountPromise = productCategories.map((categories) => Product.countDocuments({ categories }));
  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryData = [];

  productCategories.forEach((category, i) => {
    categoryData.push({
      [category]: Number(((categoriesCount[i] / totalProducts) * 100).toFixed(2)),
    });
  });

  // Creating latest orders
  const newOrders = latestOrders.map((i) => ({
    _id: i._id,
    quantity: i.orderItems.length,
    discount: i.discount,
    amount: i.total,
    status: i.status,
  }));

  stats = {
    changePercent,
    count,
    chart: {
      order: monthlyOrderCount,
      user: monthlyUserCount,
    },
    categoryData,
    newOrders,
  };

  return res.status(200).json({
    success: true,
    stats,
  });
};

// barchart
exports.getPieCharts = async (req, res) => {
  let pieCharts;

  // revenue distribution promise

  const [
    processingStatus,
    shippedStatus,
    deliveredStatus,
    productCategories,
    totalProducts,
    stockOutProducts,
    allOrders,
    totalUser,
    femaleUser,
    admins,
    allUserAge,
  ] = await Promise.all([
    Order.countDocuments({ status: "Processing" }),
    Order.countDocuments({ status: "Shipped" }),
    Order.countDocuments({ status: "Delivered" }),
    Product.distinct("categories"),
    Product.countDocuments(),
    Product.countDocuments({ stock: 0 }),
    Order.find({}).select(["subtotal", "tax", "shippingCharges", "discount", "total"]),
    User.countDocuments(),
    User.countDocuments({ gender: "female" }),
    User.countDocuments({ role: "admin" }),
    User.find({}),
  ]);

  // getting order fullfillment ratio from db
  const fullfillmentRatio = {
    Processing: processingStatus,
    Shipped: shippedStatus,
    Delivered: deliveredStatus,
  };

  // calculating all categories percentages
  const categoriesCountPromise = productCategories.map((categories) => Product.countDocuments({ categories }));
  // here categoriesCount is a array of number of product with categoriewise
  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryData = [];

  // here productCategories is a array of all categories
  productCategories.forEach((category, i) => {
    categoryData.push({
      // here we make new array of categories with its value like
      // laptop: 2
      [category]: categoriesCount[i],
    });
  });

  // find stock availability
  const inStock = totalProducts - stockOutProducts;
  const stockOut = stockOutProducts;

  // creating data for revenue distribution
  const totalRevenue = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
  const totalDiscount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
  const totalShippingCharge = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
  const totalTax = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
  const productionCost = totalRevenue * 0.4;
  const advertisingCost = totalRevenue * 0.05;
  const totalProfit = totalRevenue - (totalDiscount + totalShippingCharge + totalTax + productionCost + advertisingCost);

  const revenueDiatribution = {
    totalDiscount,
    totalShippingCharge,
    totalTax,
    productionCost,
    advertisingCost,
    totalProfit,
  };

  // user age groups
  const ageGroups = {
    kid: 0,
    young: 0,
    adult: 0,
    middleAged: 0,
    senior: 0,
  };

  allUserAge.forEach((user) => {
    const age = user.age;
    if (age <= 18) {
      ageGroups["kid"]++;
    } else if (age <= 30) {
      ageGroups["young"]++;
    } else if (age <= 45) {
      ageGroups["adult"]++;
    } else if (age <= 60) {
      ageGroups["middleAged"]++;
    } else {
      ageGroups["senior"]++;
    }
  });

  // counting gender ratios
  const genderCount = {
    male: totalUser - femaleUser,
    female: femaleUser,
  };

  // counting userAuth ratios
  const userAuth = {
    users: totalUser - admins,
    admins: admins,
  };

  pieCharts = {
    fullfillmentRatio,
    categoryData,
    stockAvibility: {
      inStock,
      stockOut,
    },
    revenueDiatribution,
    ageGroups,
    genderCount,
    userAuth,
  };

  return res.status(200).json({
    success: true,
    pieCharts,
  });
};

// barchart
exports.getBarCharts = async (req, res) => {
  let barCharts;

  // Fetch all users and orders
  const users = await User.find({ role: "user" }, { createdAt: 1 });
  const orders = await Order.find({}, { createdAt: 1, total: 1, discount: 1, shippingCharges: 1, tax: 1 });

  // Initialize arrays for revenue, order count, user and profit
  const userArray = Array(12).fill(0);
  const revenueArray = Array(12).fill(0);
  const orderCountArray = Array(12).fill(0);
  const profitArray = Array(12).fill(0);

  // Calculate monthly stats for users
  users.forEach((user) => {
    const month = user.createdAt.getMonth();
    userArray[month] += 1;
  });

  // Calculate monthly revenue, order count, and profit
  orders.forEach((order) => {
    const month = order.createdAt.getMonth();
    const productionCost = order.total * 0.4;
    const advertisingCost = order.total * 0.05;
    const profit = order.total - (order.discount + order.shippingCharges + order.tax + productionCost + advertisingCost);
    profitArray[month] += profit;
    revenueArray[month] += order.total;
    orderCountArray[month] += 1;
  });

  // Rearrange arrays to put current month data at last position
  const currentMonth = new Date().getMonth();
  const rearrangedProfitArray = [...profitArray.slice(currentMonth + 1), ...profitArray.slice(0, currentMonth + 1)];
  const rearrangedRevenueArray = [...revenueArray.slice(currentMonth + 1), ...revenueArray.slice(0, currentMonth + 1)];
  const rearrangedOrderCountArray = [...orderCountArray.slice(currentMonth + 1), ...orderCountArray.slice(0, currentMonth + 1)];
  const rearrangedUserArray = [...userArray.slice(currentMonth + 1), ...userArray.slice(0, currentMonth + 1)];

  barCharts = {
    chart1: {
      profit: rearrangedProfitArray,
      revenue: rearrangedRevenueArray,
    },
    chart2: {
      order: rearrangedOrderCountArray,
      user: rearrangedUserArray,
    },
  };

  return res.status(200).json({
    success: true,
    barCharts,
  });
};

// linechart
exports.getLineCharts = async (req, res) => {
  let lineChart = {};

  // Fetch active users
  const users = await User.find({ role: "user" }, { createdAt: 1 });
  const activeUserArray = Array(12).fill(0);
  users.forEach((user) => {
    const month = user.createdAt.getMonth();
    activeUserArray[month] += 1;
  });

  // Fetch total products for each month
  const totalProductArray = Array(12).fill(0);
  const products = await Product.find({}, { createdAt: 1 });
  products.forEach((product) => {
    const month = product.createdAt.getMonth();
    totalProductArray[month] += 1;
  });

  // Fetch orders and calculate total revenue and total discount allocated for each month
  const orders = await Order.find({}, { createdAt: 1, total: 1, discount: 1 });
  const totalRevenueArray = Array(12).fill(0);
  const totalDiscountArray = Array(12).fill(0);
  orders.forEach((order) => {
    const month = order.createdAt.getMonth();
    totalRevenueArray[month] += order.total;
    totalDiscountArray[month] += order.discount;
  });

  // Rearrange arrays to put current month data at last position
  const currentMonth = new Date().getMonth();
  const rearrangedActiveUserArray = [...activeUserArray.slice(currentMonth + 1), ...activeUserArray.slice(0, currentMonth + 1)];
  const rearrangedTotalProductArray = [...totalProductArray.slice(currentMonth + 1), ...totalProductArray.slice(0, currentMonth + 1)];
  const rearrangedTotalRevenueArray = [...totalRevenueArray.slice(currentMonth + 1), ...totalRevenueArray.slice(0, currentMonth + 1)];
  const rearrangedTotalDiscountArray = [...totalDiscountArray.slice(currentMonth + 1), ...totalDiscountArray.slice(0, currentMonth + 1)];

  // Prepare lineChart object
  lineChart = {
    activeUser: rearrangedActiveUserArray,
    totalProducts: rearrangedTotalProductArray,
    totalRevenue: rearrangedTotalRevenueArray,
    totalDiscount: rearrangedTotalDiscountArray,
  };

  return res.status(200).json({
    success: true,
    lineChart,
  });
};
