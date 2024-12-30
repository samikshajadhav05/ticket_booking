import React, { useState } from 'react';
import './App.css';

const App = () => {
  const totalSeats = 80;
  const seatsPerRow = 7;

  const generateSeats = () => {
    let seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({
        seatNumber: i,
        isAvailable: true, 
      });
    }
    return seats;
  };

  const [seats, setSeats] = useState(generateSeats());
  const [seatInput, setSeatInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  const handleBooking = () => {
    const numSeatsToBook = parseInt(seatInput, 10);

    if (numSeatsToBook >= 1 && numSeatsToBook <= 7) {
        const availableSeats = seats.filter(seat => seat.isAvailable);
        let bookedSeats = [];
        let remainingSeatsToBook = numSeatsToBook;

        for (let rowIndex = 0; rowIndex < Math.ceil(totalSeats / seatsPerRow); rowIndex++) {
            const rowSeats = seats.slice(rowIndex * seatsPerRow, (rowIndex + 1) * seatsPerRow);
            const availableRowSeats = rowSeats.filter(seat => seat.isAvailable);

            if (availableRowSeats.length >= remainingSeatsToBook) {
                bookedSeats = availableRowSeats.slice(0, remainingSeatsToBook);
                remainingSeatsToBook = 0;
                break;
            }
        }

        if (remainingSeatsToBook > 0) {
            const additionalSeats = availableSeats.filter(seat => !bookedSeats.includes(seat));
            bookedSeats = bookedSeats.concat(additionalSeats.slice(0, remainingSeatsToBook));
        }

        if (bookedSeats.length < numSeatsToBook) {
            setBookingError('No more seats available');
        } else {
            const updatedSeats = [...seats];
            bookedSeats.forEach(seat => {
                const seatIndex = updatedSeats.findIndex(s => s.seatNumber === seat.seatNumber);
                updatedSeats[seatIndex].isAvailable = false; 
            });

            setSeats(updatedSeats);
            setSeatInput('');
            setErrorMessage('');
            setBookingError('');
        }
    } else {
        setErrorMessage('Invalid seat number. Enter a number between 1 and 7.');
    }
  };

  const handleReset = () => {
    setSeats(generateSeats()); 
    setSeatInput('');
    setErrorMessage('');
    setBookingError('');
  };

  const availableCount = seats.filter(seat => seat.isAvailable).length;
  const bookedCount = seats.filter(seat => !seat.isAvailable).length;

  return (
    <div className="container">
      <div className="seat-box">
      <h1>Ticket Booking</h1>
        <div className="seat-container">
          {Array.from({ length: Math.ceil(totalSeats / seatsPerRow) }).map((_, rowIndex) => (
            <div key={rowIndex} className="row">
              {seats
                .slice(rowIndex * seatsPerRow, rowIndex * seatsPerRow + seatsPerRow)
                .map((seat, seatIndex) => (
                  <button
                    key={seatIndex}
                    className={`seat ${seat.isAvailable ? 'available' : 'unavailable'}`}
                    disabled={!seat.isAvailable}
                  >
                    {seat.seatNumber}
                  </button>
                ))}
            </div>
          ))}
        </div>
        <div className="display">
          <div className='book'><h1>Booked Seats = {bookedCount}</h1></div>
          <div className='avaliablebox'><h1>Avaliable Seats = {availableCount}</h1></div>
        </div>
      </div>

      <div className="right-panel">
        <div className="input-container">
          <input
            type="number"
            value={seatInput}
            placeholder='Enter the number of seats'
            onChange={(e) => setSeatInput(e.target.value)}
            min="1"
            max="7"
            className="seat-input"
          />
          <button onClick={handleBooking} className="book-btn">Book</button>
          {errorMessage && <span className="error-message">{errorMessage}</span>}
        </div>

        {bookingError && <div className="booking-error">{bookingError}</div>}

        <button onClick={handleReset} className="reset-btn">Reset Seats</button>
      </div>
    </div>
  );
};

export default App;

