const express = require("express");
const statsController = require("../controllers/statsController");
const adminOnly = require("../middlewares/userAuth");

const router = express.Router();

// route - /api/v1/dashboard/stats
router.get("/stats", adminOnly, statsController.getDashboardStats);

// route - /api/v1/dashboard/bar
router.get("/bar", adminOnly, statsController.getBarCharts);

// route - /api/v1/dashboard/pie
router.get("/pie", adminOnly, statsController.getPieCharts);

// route - /api/v1/dashboard/line
router.get("/line", adminOnly, statsController.getLineCharts);

module.exports = router;
