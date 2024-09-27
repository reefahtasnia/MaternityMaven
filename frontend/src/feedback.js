import React, { useState } from "react";
import axios from "axios";
import './CSS/feedback.css';

const Feedback = () => {
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (newRating) => {
    setRating(newRating);
  };

  const handleRatingHover = (newRating) => {
    setHoverRating(newRating);
  };

  const handleRatingHoverOut = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the feedback data
    const feedbackData = {
      description: description,
      rate: rating,
      user_id: 1, // Assuming you have user ID logic in place
      doctor_id: "DOC123" // Replace with the actual doctor ID
    };

    try {
      const response = await axios.post("http://localhost:3001/api/feedback", feedbackData);
      console.log("Feedback submitted:", response.data);
      // Reset the form
      setDescription("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="feedback-container">
      <h1>FEEDBACK</h1>
      <p>Help us improve by sending us feedback</p>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

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
              &#9733; {/* Star character */}
            </span>
          ))}
        </div>
        <p>Rate us!</p>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default Feedback;
