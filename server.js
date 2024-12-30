const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 5000;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "train_booking",
    password: "password",
    port: "5432"
});

app.use(express.json()); 
app.use(cors()); 

// Get all seats
app.get('/api/seats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM seats ORDER BY seat_number');
    res.json(result.rows); 
  } catch (err) {
    console.error('Error fetching seats:', err);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

// Update seat booking
app.put('/api/seats', async (req, res) => {
  const bookedSeats = req.body.seats;

  try {
    await pool.query('BEGIN');

    for (const seatNumber of bookedSeats) {
      const result = await pool.query(
        'UPDATE seats SET is_available = FALSE WHERE seat_number = $1 AND is_available = TRUE RETURNING seat_number',
        [seatNumber]
      );

      if (result.rowCount === 0) {
        throw new Error(`Seat number ${seatNumber} is already booked`);
      }
    }

    await pool.query('COMMIT');
    res.json({ message: 'Seats booked successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error booking seats:', err);
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
