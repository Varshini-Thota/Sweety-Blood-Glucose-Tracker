
require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("./db");

async function seedDatabase() {
  try {
    const name = "Demo User";
    const email = "demo@example.com";
    const password = "DemoPass123";

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [name, email, passwordHash]
    );

    const userId = userResult.rows[0].id;

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    const sampleReadings = [
      ["Morning fasting", 110],
      ["After breakfast", 145],
      ["After lunch", 135],
      ["After dinner", 125]
    ];

    for (const [slot, value] of sampleReadings) {
      await pool.query(
        `INSERT INTO readings
          (user_id, reading_date, slot, value_mg_dl)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, slot)
         DO UPDATE SET value_mg_dl = EXCLUDED.value_mg_dl`,
        [userId, today, slot, value]
      );
    }

    console.log("Demo data inserted successfully!");
    console.log("Email: demo@example.com");
    console.log("Password: DemoPass123");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await pool.end();
  }
}

seedDatabase();
