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
        console.log('Fetched History Data:', response.data); // Debugging: log the fetched data
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
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      <h2 style={{ textAlign: 'center', color: '#ff69b4' }}>
        {showHistory ? 'Fetal Movement History' : 'Fetal Movement Tracker'}
      </h2>
      
      {!showHistory ? (
        <form onSubmit={handleSave} style={{ margin: '20px auto', maxWidth: '400px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Baby Movement:</label>
            <input
              type="text"
              value={babyMovement}
              onChange={(e) => setBabyMovement(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Duration (in minutes):</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ backgroundColor: '#ff69b4', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
          <button type="button" onClick={handleToggleHistory} style={{ marginLeft: '10px', backgroundColor: '#ff69b4', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>View History</button>

          {/* Display success message */}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </form>
      ) : (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '2px solid #ff69b4' , color: 'black', fontSize: '20px'}}>Baby Movement</th>
                <th style={{ borderBottom: '2px solid #ff69b4' , color: 'black', fontSize: '20px' }}>Duration</th>
                <th style={{ borderBottom: '2px solid #ff69b4' , color: 'black', fontSize: '20px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((entry, index) => (
                <tr key={index}>
                  <td style={{ color: 'black', fontSize: '16px' }}>{entry.BABY_MOVEMENT}</td>
                  <td style={{ color: 'black', fontSize: '16px' }}>{entry.DURATION}</td>
                  <td style={{ color: 'black', fontSize: '16px' }}>{new Date(entry.MOVEMENT_DATE).toLocaleDateString()}</td> {/* Format date for display */}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleBack} style={{ marginTop: '20px', backgroundColor: '#ff69b4', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back to Form</button>
        </div>
      )}
    </div>
  );
};

export default FetalMovement;
