import React from 'react';
import './CSS/WaitingPage.css'; // Import the CSS file for styling

const WaitingPage = () => {
  return (
    <div className="waiting-page">
      <div className="waiting-text">
        Loading<span className="dots">...</span>
      </div>
    </div>
  );
};

export default WaitingPage;
