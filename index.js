import express from "express";
import cors from "cors";
import pool from "./db.js"; // your new db file

const app = express();
app.use(cors());
app.use(express.json());

// GET all jobs
app.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM jobs ORDER BY posted_time DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a job
app.post("/jobs", async (req, res) => {
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

  try {
    const result = await pool.query(
      `INSERT INTO jobs (title, company, location, job_type, salary_min, salary_max, deadline, description) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        title,
        company,
        location,
        job_type,
        salary_min,
        salary_max,
        deadline,
        description,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FILTER jobs by type
app.get("/jobs/filter", async (req, res) => {
  const { job_type } = req.query;
  if (!job_type)
    return res
      .status(400)
      .json({ error: "job_type query parameter is required" });

  try {
    const result = await pool.query("SELECT * FROM jobs WHERE job_type=$1", [
      job_type,
    ]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
