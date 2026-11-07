const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getReadings,
    createReading,
    updateReading,
    deleteReading
} = require("../controllers/readingController");

// Get readings (protected route)
router.get("/", authMiddleware, getReadings);

// Add a reading (protected route)
router.post("/", authMiddleware, createReading);

// Update an existing reading
router.put("/:id", authMiddleware, updateReading);

// Delete a reading
router.delete("/:id", authMiddleware, deleteReading);

module.exports = router;