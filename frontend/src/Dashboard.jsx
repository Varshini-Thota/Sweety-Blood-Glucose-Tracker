
import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard({ token, user, onLogout }) {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [readings, setReadings] = useState([]);
  const [readingDate, setReadingDate] = useState(todayString);
  const [slot, setSlot] = useState("Morning fasting");
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [dailyDate, setDailyDate] = useState(todayString);
  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyMonth, setMonthlyMonth] = useState(todayString.slice(0, 7));
  const [monthlyReport, setMonthlyReport] = useState(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  async function loadReadings() {
    try {
      const response = await fetch("http://localhost:5000/api/readings", {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load readings");
      }

      if (Array.isArray(data)) {
        setReadings(data);
      } else if (Array.isArray(data.readings)) {
        setReadings(data.readings);
      } else {
        console.error("Unexpected readings response:", data);
        setReadings([]);
        setMessage("Could not understand the readings returned by the server.");
      }
    } catch (error) {
      setReadings([]);
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadReadings();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const url = editingId
      ? `http://localhost:5000/api/readings/${editingId}`
      : "http://localhost:5000/api/readings";

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers,
        body: JSON.stringify({
          reading_date: readingDate,
          slot,
          value_mg_dl: Number(value),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save reading");
      }

      setMessage(
        editingId
          ? "Reading updated successfully!"
          : "Reading added successfully!"
      );

      setReadingDate(todayString);
      setSlot("Morning fasting");
      setValue("");
      setEditingId(null);

      await loadReadings();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(reading) {
    setEditingId(reading.id);
    setReadingDate(String(reading.reading_date).slice(0, 10));
    setSlot(reading.slot);
    setValue(String(reading.value_mg_dl));
    setMessage("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this reading?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/readings/${id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete reading");
      }

      setMessage("Reading deleted successfully!");
      await loadReadings();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadDailyReport() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/daily?date=${dailyDate}`,
        { headers }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load daily report");
      }

      setDailyReport(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function loadMonthlyReport() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reports/monthly?month=${monthlyMonth}`,
        { headers }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load monthly report");
      }

      setMonthlyReport(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setReadingDate(todayString);
    setSlot("Morning fasting");
    setValue("");
    setMessage("");
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Sweety 💗</h1>
          <p>Your Personal Blood Glucose Tracker</p>
        </div>

        <div className="welcome-area">
          <span>Welcome, {user.name}!</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">

        <section className="dashboard-card">
          <h2>{editingId ? "Update Reading" : "Add Glucose Reading"}</h2>

          <form className="reading-form" onSubmit={handleSubmit}>
            <label>
              Reading Date
              <input
                type="date"
                value={readingDate}
                max={todayString}
                onChange={(e) => setReadingDate(e.target.value)}
                required
              />
            </label>

            <label>
              Reading Slot
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
              >
                <option>Morning fasting</option>
                <option>After breakfast</option>
                <option>After lunch</option>
                <option>After dinner</option>
              </select>
            </label>

            <label>
              Glucose Value (mg/dL)
              <input
                type="number"
                min="40"
                max="600"
                step="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter glucose value"
                required
              />
            </label>

            <div className="form-buttons">
              <button type="submit">
                {editingId ? "Update Reading" : "Add Reading"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && (
            <p className="dashboard-message">{message}</p>
          )}
        </section>

        <section className="dashboard-card">
          <h2>My Glucose Readings</h2>

          {readings.length === 0 ? (
            <p>No readings added yet. Add your first reading above.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Slot</th>
                    <th>Value (mg/dL)</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {readings.map((reading) => (
                    <tr key={reading.id}>
                      <td>
                        {String(reading.reading_date).slice(0, 10)}
                      </td>
                      <td>{reading.slot}</td>
                      <td>{reading.value_mg_dl}</td>
                      <td>
                        <button onClick={() => handleEdit(reading)}>
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(reading.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <h2>Daily Report</h2>

          <div className="report-controls">
            <input
              type="date"
              value={dailyDate}
              max={todayString}
              onChange={(e) => setDailyDate(e.target.value)}
            />

            <button onClick={loadDailyReport}>
              View Daily Report
            </button>
          </div>

          {dailyReport && (
            <div className="report-results">
              <p>Total readings: {dailyReport.total_readings}</p>
              <p>Highest: {dailyReport.highest ?? "—"} mg/dL</p>
              <p>Lowest: {dailyReport.lowest ?? "—"} mg/dL</p>
              <p>Average: {dailyReport.average ?? "—"} mg/dL</p>

              {dailyReport.readings?.length > 0 ? (
                dailyReport.readings.map((reading) => (
                  <p key={reading.id}>
                    {reading.slot}: {reading.value_mg_dl} mg/dL
                  </p>
                ))
              ) : (
                <p>No readings found for this date.</p>
              )}
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <h2>Monthly Report</h2>

          <div className="report-controls">
            <input
              type="month"
              value={monthlyMonth}
              onChange={(e) => setMonthlyMonth(e.target.value)}
            />

            <button onClick={loadMonthlyReport}>
              View Monthly Report
            </button>
          </div>

          {monthlyReport && (
            <div className="report-results">
              <p>Total readings: {monthlyReport.total_readings}</p>
              <p>Highest: {monthlyReport.highest ?? "—"} mg/dL</p>
              <p>Lowest: {monthlyReport.lowest ?? "—"} mg/dL</p>
              <p>Average: {monthlyReport.average ?? "—"} mg/dL</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
