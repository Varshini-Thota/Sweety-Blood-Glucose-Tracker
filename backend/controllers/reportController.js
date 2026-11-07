const pool = require("../db");

// Get daily glucose report
const getDailyReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: "Please provide a date"
            });
        }

        const result = await pool.query(
            `SELECT
                COUNT(*)::int AS total_readings,
                MAX(value_mg_dl)::int AS highest,
                MIN(value_mg_dl)::int AS lowest,
                ROUND(AVG(value_mg_dl), 1) AS average
             FROM readings
             WHERE user_id = $1 AND reading_date = $2`,
            [userId, date]
        );

        const readings = await pool.query(
            `SELECT id, reading_date, slot, value_mg_dl
             FROM readings
             WHERE user_id = $1 AND reading_date = $2
             ORDER BY
                CASE slot
                    WHEN 'Morning fasting' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                END`,
            [userId, date]
        );

        res.status(200).json({
            date,
            summary: result.rows[0],
            readings: readings.rows
        });

    } catch (error) {
        console.error("Daily report error:", error.message);

        res.status(500).json({
            message: "Could not generate daily report"
        });
    }
};

// Get monthly glucose report
const getMonthlyReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query;

        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({
                message: "Please provide month in YYYY-MM format"
            });
        }

        const result = await pool.query(
            `SELECT
                COUNT(*)::int AS total_readings,
                MAX(value_mg_dl)::int AS highest,
                MIN(value_mg_dl)::int AS lowest,
                ROUND(AVG(value_mg_dl), 1) AS average
             FROM readings
             WHERE user_id = $1
             AND reading_date >= TO_DATE($2, 'YYYY-MM')
             AND reading_date < (TO_DATE($2, 'YYYY-MM') + INTERVAL '1 month')`,
            [userId, month]
        );

        res.status(200).json({
            month,
            summary: result.rows[0]
        });

    } catch (error) {
        console.error("Monthly report error:", error.message);

        res.status(500).json({
            message: "Could not generate monthly report"
        });
    }
};

module.exports = {
    getDailyReport,
    getMonthlyReport
};