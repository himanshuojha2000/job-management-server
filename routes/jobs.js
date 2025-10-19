import express from "express";
import db from "../db.js";

const router = express.Router();

// Create a new job
router.post("/create", (req, res) => {
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

  // Check for missing fields
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
    return res.status(400).json({ message: "All fields are required" });
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
      if (err) {
        console.error("❌ Error inserting job:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json({
        message: "✅ Job created successfully!",
        jobId: result.insertId,
      });
    }
  );
});

// Fetch all jobs
router.get("/", (req, res) => {
  db.query("SELECT * FROM jobs ORDER BY posted_time DESC", (err, results) => {
    if (err) {
      console.error("❌ Error fetching jobs:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(results);
  });
});

// Filter jobs by job_type
router.get("/filter", (req, res) => {
  const { job_type } = req.query;
  if (!job_type)
    return res.status(400).json({ message: "Job type is required" });

  db.query(
    "SELECT * FROM jobs WHERE job_type = ? ORDER BY posted_time DESC",
    [job_type],
    (err, results) => {
      if (err) {
        console.error("❌ Error filtering jobs:", err);
        return res.status(500).json({ message: "Database error" });
      }
      res.status(200).json(results);
    }
  );
});

export default router;
