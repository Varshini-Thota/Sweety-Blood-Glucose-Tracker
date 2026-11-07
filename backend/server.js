const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

const PORT = 5000;

// Middleware to read JSON data
app.use(express.json());

app.use(cors());

// Authentication routes
app.use("/api/auth", authRoutes);

app.use("/api/readings", readingRoutes);

app.use("/api/reports", reportRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("Sweety Backend is Running!");
});

// Database health check route
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database, current_user AS database_user"
        );

        res.status(200).json({
            message: "Sweety backend is running",
            database: result.rows[0].database,
            user: result.rows[0].database_user
        });

    } catch (error) {
        console.error("Database health check failed:", error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});