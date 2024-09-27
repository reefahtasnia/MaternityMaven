import React, { useState } from "react";
import './CSS/feedback.css'; // Import the CSS file for styling

const Feedback = () => {
  const [rating, setRating] = useState(0); // Default rating is 0
  const [hoverRating, setHoverRating] = useState(0); // Track hovered rating

  // Function to handle star click and update rating
  const handleRatingClick = (newRating) => {
    setRating(newRating);
  };

  // Function to handle star hover
  const handleRatingHover = (newRating) => {
    setHoverRating(newRating);
  };

  // Function to reset hover when mouse leaves stars
  const handleRatingHoverOut = () => {
    setHoverRating(0);
  };

  return (
    <div>

      <div className="feedback-container">
        <h1>FEEDBACK</h1>
        <p>Help us improve by sending us feedback</p>

        {/* Textarea for the description */}
        <textarea
          placeholder="Description"
        ></textarea>

        {/* Star rating system */}
        <div className="rating">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={
                (hoverRating || rating) > index ? "star filled" : "star outlined"
              }
              onClick={() => handleRatingClick(index + 1)}
              onMouseEnter={() => handleRatingHover(index + 1)}
              onMouseLeave={handleRatingHoverOut}
            >
              &#9733;
            </span>
          ))}
        </div>
        <p>Rate us!</p>

        {/* Submit Button */}
        <button className="submit-btn">Submit</button>
      </div>
    </div>
  );
};

export default Feedback;
