const pool = require("../db");

// Get all readings for the logged-in user
const getReadings = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, reading_date, slot, value_mg_dl, created_at
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, created_at DESC`,
            [userId]
        );

        res.status(200).json({
            readings: result.rows
        });

    } catch (error) {
        console.error("Get readings error:", error.message);

        res.status(500).json({
            message: "Could not retrieve readings"
        });
    }
};

// Add a new glucose reading
const createReading = async (req, res) => {
    try {
        const userId = req.user.id;

        const { reading_date, slot, value_mg_dl } = req.body;

        // Check required fields
        if (!reading_date || !slot || value_mg_dl === undefined) {
            return res.status(400).json({
                message: "Date, slot, and glucose value are required"
            });
        }

        // Validate glucose value
        const glucoseValue = Number(value_mg_dl);

        if (
            !Number.isInteger(glucoseValue) ||
            glucoseValue < 40 ||
            glucoseValue > 600
        ) {
            return res.status(400).json({
                message: "Glucose value must be a whole number between 40 and 600"
            });
        }

        // Validate reading slot
        const allowedSlots = [
            "Morning fasting",
            "After breakfast",
            "After lunch",
            "After dinner"
        ];

        if (!allowedSlots.includes(slot)) {
            return res.status(400).json({
                message: "Invalid reading slot"
            });
        }

        // Validate date format and prevent future dates
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(reading_date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        const parsedDate = new Date(`${reading_date}T00:00:00Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== reading_date
        ) {
            return res.status(400).json({
                message: "Please enter a valid date"
            });
        }

        const today = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata"
        });

        if (reading_date > today) {
            return res.status(400).json({
                message: "Future dates are not allowed"
            });
        }

        // Save the reading
        const result = await pool.query(
            `INSERT INTO readings (user_id, reading_date, slot, value_mg_dl)
             VALUES ($1, $2, $3, $4)
             RETURNING id, reading_date, slot, value_mg_dl, created_at`,
            [userId, reading_date, slot, glucoseValue]
        );

        res.status(201).json({
            message: "Glucose reading added successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        // Duplicate slot on the same day
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this slot on this date"
            });
        }

        console.error("Create reading error:", error.message);

        res.status(500).json({
            message: "Could not add glucose reading"
        });
    }
};

// Update an existing glucose reading
const updateReading = async (req, res) => {
    try {
        const userId = req.user.id;
        const readingId = req.params.id;

        const { reading_date, slot, value_mg_dl } = req.body;

        // Check required fields
        if (!reading_date || !slot || value_mg_dl === undefined) {
            return res.status(400).json({
                message: "Date, slot, and glucose value are required"
            });
        }

        // Validate glucose value
        const glucoseValue = Number(value_mg_dl);

        if (
            !Number.isInteger(glucoseValue) ||
            glucoseValue < 40 ||
            glucoseValue > 600
        ) {
            return res.status(400).json({
                message: "Glucose value must be a whole number between 40 and 600"
            });
        }

        // Validate slot
        const allowedSlots = [
            "Morning fasting",
            "After breakfast",
            "After lunch",
            "After dinner"
        ];

        if (!allowedSlots.includes(slot)) {
            return res.status(400).json({
                message: "Invalid reading slot"
            });
        }

        // Validate date
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(reading_date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        const parsedDate = new Date(`${reading_date}T00:00:00Z`);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== reading_date
        ) {
            return res.status(400).json({
                message: "Please enter a valid date"
            });
        }

        const today = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata"
        });

        if (reading_date > today) {
            return res.status(400).json({
                message: "Future dates are not allowed"
            });
        }

        // Update only the logged-in user's reading
        const result = await pool.query(
            `UPDATE readings
             SET reading_date = $1,
                 slot = $2,
                 value_mg_dl = $3
             WHERE id = $4 AND user_id = $5
             RETURNING id, reading_date, slot, value_mg_dl, created_at`,
            [reading_date, slot, glucoseValue, readingId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found"
            });
        }

        res.status(200).json({
            message: "Reading updated successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this slot on this date"
            });
        }

        console.error("Update reading error:", error.message);

        res.status(500).json({
            message: "Could not update reading"
        });
    }
};

const deleteReading = async (req, res) => {
    try {
        const userId = req.user.id;
        const readingId = req.params.id;

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [readingId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found"
            });
        }

        res.status(200).json({
            message: "Reading deleted successfully"
        });

    } catch (error) {
        console.error("Delete reading error:", error.message);

        res.status(500).json({
            message: "Could not delete reading"
        });
    }
};

module.exports = { getReadings, createReading, updateReading,  deleteReading};