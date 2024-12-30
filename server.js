const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 5000;

// Database connection setup
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "train_booking",
    password: "2004",
    port: "5432"
});

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS for all origins

// Get all seats
app.get('/api/seats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM seats ORDER BY seat_number');
    res.json(result.rows); // Return the seats data
  } catch (err) {
    console.error('Error fetching seats:', err);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

// Update seat availability (booking)
app.put('/api/seats', async (req, res) => {
  const bookedSeats = req.body.seats; // Array of seat numbers to be booked

  try {
    // Begin a transaction
    await pool.query('BEGIN');

    // Mark each seat as unavailable
    for (const seatNumber of bookedSeats) {
      const result = await pool.query(
        'UPDATE seats SET is_available = FALSE WHERE seat_number = $1 AND is_available = TRUE RETURNING seat_number',
        [seatNumber]
      );

      // If the seat was not available, throw an error
      if (result.rowCount === 0) {
        throw new Error(`Seat number ${seatNumber} is already booked`);
      }
    }

    // Commit the transaction
    await pool.query('COMMIT');
    res.json({ message: 'Seats booked successfully' });
  } catch (err) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error booking seats:', err);
    res.status(400).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
