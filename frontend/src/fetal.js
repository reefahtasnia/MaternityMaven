import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const FetalMovement = () => {
  const auth = JSON.parse(localStorage.getItem("user"));
  const [babyMovement, setBabyMovement] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');
  const [historyData, setHistoryData] = useState([]);  
  const [showHistory, setShowHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fetch history on component load or when the "View History" button is clicked
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/fetal-movement/history`, {
          params: { userid: auth.userId }, // Pass the user_id as query parameter
        });
        setHistoryData(response.data);
      } catch (error) {
        console.error('Error fetching fetal movement history:', error);
      }
    };

    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory, auth.userId]); // Re-fetch history when `showHistory` state changes or `auth.userId` updates

  // Handle saving fetal movement data
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/fetal-movement', {
        user_id: auth.userId, 
        baby_movement: babyMovement,
        duration: parseInt(duration),
        movement_date: date
      });
      setBabyMovement('');
      setDuration('');
      setDate('');
      setSuccessMessage('Data saved successfully!'); 

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Fetch updated history
      const response = await axios.get('http://localhost:5000/api/fetal-movement/history', {
        params: { userid: auth.userId }, // Pass user_id when fetching history
      });
      setHistoryData(response.data);

    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Toggle showing history
  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Navigate back after showing history
  const handleBack = () => {
    setShowHistory(false);
  };

  return (
    <div>
      <h2>{showHistory ? 'Fetal Movement History' : 'Fetal Movement Tracker'}</h2>
      
      {!showHistory ? (
        <form onSubmit={handleSave}>
          <div>
            <label>Baby Movement:</label>
            <input
              type="text"
              value={babyMovement}
              onChange={(e) => setBabyMovement(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Duration (in minutes):</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={handleToggleHistory}>View History</button>

          {/* Display success message */}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </form>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Baby Movement</th>
                <th>Duration</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.baby_movement}</td>
                  <td>{entry.duration}</td>
                  <td>{entry.movement_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleBack}>Back to Form</button>
        </div>
      )}
    </div>
  );
};

export default FetalMovement;
