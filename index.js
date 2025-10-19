const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Create SQLite DB file
const db = new sqlite3.Database("./jobs.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database.");
});

// Create jobs table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  company TEXT,
  location TEXT,
  job_type TEXT,
  salary_min TEXT,
  salary_max TEXT,
  deadline TEXT,
  description TEXT,
  posted_time DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// GET all jobs
app.get("/jobs", (req, res) => {
  db.all("SELECT * FROM jobs ORDER BY posted_time DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
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

  const query = `INSERT INTO jobs 
    (title, company, location, job_type, salary_min, salary_max, deadline, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
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
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
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

// FILTER jobs by type
app.get("/jobs/filter", (req, res) => {
  const { job_type } = req.query; // filter by job_type
  if (!job_type)
    return res
      .status(400)
      .json({ error: "job_type query parameter is required" });

  db.all("SELECT * FROM jobs WHERE job_type = ?", [job_type], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
