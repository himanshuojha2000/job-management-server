import express from "express";
import cors from "cors";
import db from "./db.js"; // MySQL connection

const app = express();
app.use(cors());
app.use(express.json());

// Create jobs table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  job_type VARCHAR(100) NOT NULL,
  salary_min VARCHAR(50) NOT NULL,
  salary_max VARCHAR(50) NOT NULL,
  deadline VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  posted_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

db.query(createTableQuery, (err, result) => {
  if (err) console.error("❌ Error creating table:", err);
  else console.log("✅ Jobs table ready in MySQL.");
});

// GET all jobs
app.get("/jobs", (req, res) => {
  db.query("SELECT * FROM jobs ORDER BY posted_time DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// CREATE a job
app.post("/jobs", (req, res) => {
  const {
    title,
    company,
    location,
    job_type,
    salary_min,
    salary_max,
    deadline,
    description,
  } = req.body;

  if (
    !title ||
    !company ||
    !location ||
    !job_type ||
    !salary_min ||
    !salary_max ||
    !deadline ||
    !description
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO jobs
    (title, company, location, job_type, salary_min, salary_max, deadline, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      title,
      company,
      location,
      job_type,
      salary_min,
      salary_max,
      deadline,
      description,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: result.insertId,
        title,
        company,
        location,
        job_type,
        salary_min,
        salary_max,
        deadline,
        description,
      });
    }
  );
});

// FILTER jobs by job_type
app.get("/jobs/filter", (req, res) => {
  const { job_type } = req.query;
  if (!job_type) return res.status(400).json({ error: "job_type is required" });

  db.query(
    "SELECT * FROM jobs WHERE job_type = ? ORDER BY posted_time DESC",
    [job_type],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
