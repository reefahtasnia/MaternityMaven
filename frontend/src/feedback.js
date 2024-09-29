import React, { useState,useEffect } from "react";
import "./CSS/feedback.css";

const Feedback = () => {
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userId, setUserId] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userType = localStorage.getItem("userType");

    if (userType === "doctor" && user) {
      setDoctorId(user.BMDC); 
    } else if (userType !== "doctor" && user) {
      setUserId(user.userId); 
    }
  }, []);
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
    const feedbackData = {
      description,
      rate: rating,
      user_id: userId,
      doctor_id: doctorId,
    };

    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        const responseData = await response.json();// Assuming the server sends back JSON data
        alert(responseData.message);
        setDescription("");
        setRating(0);
      } else {
        const errorResponse = await response.json(); // Assuming the server sends back JSON error data
        alert(`Failed to submit feedback: ${errorResponse.message}`);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback due to network error.");
    }
  };

  return (
    <div className="feedback-div-container">
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
                  (hoverRating || rating) > index
                    ? "star filled"
                    : "star outlined"
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
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
