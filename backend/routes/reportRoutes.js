const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getDailyReport,
    getMonthlyReport
} = require("../controllers/reportController");

// Daily report
router.get("/daily", authMiddleware, getDailyReport);

// Monthly report
router.get("/monthly", authMiddleware, getMonthlyReport);

module.exports = router;