import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./CSS/bookAppointment.css";

const BookAppointment = () => {
  const { email } = useParams();
  const [appointmentDetails, setAppointmentDetails] = useState({
    email: decodeURIComponent(email),
    date: "",
    time: "",
    day: "",
    userId: "", // Initially empty, will be set later
  });

  const getUserFromLocalStorage = () => {
    const userString = localStorage.getItem("user");
    try {
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Failed to parse user from local storage:", error);
      return null;
    }
  };

  const auth = getUserFromLocalStorage();
  const userId = auth ? auth.userId : null;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAppointmentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkAvailability = async () => {
    try {
      const response = await fetch("http://localhost:5000/check-appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: appointmentDetails.date,
          time: appointmentDetails.time,
          email: appointmentDetails.email,
          day: appointmentDetails.day,
          userId: userId,
        }),
      });

      return response.ok; // Return true if the slot is available
    } catch (error) {
      console.error("Error checking availability:", error);
      return false; // If there's an error, assume the slot is not available
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Set userId in appointmentDetails before checking availability
    const newAppointmentDetails = {
      ...appointmentDetails,
      userId: userId, // Add userId here
    };

    // Check availability of the appointment slot
    const isAvailable = await checkAvailability();

    if (isAvailable) {
      try {
        const response = await fetch("http://localhost:5000/book-appointment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAppointmentDetails),
        });

        if (response.ok) {
          alert("Appointment booked successfully!");
          setAppointmentDetails({
            email: decodeURIComponent(email),
            date: "",
            time: "",
            day: "",
            userId: "", // Reset userId after booking
          });
        } else {
          const errorData = await response.json();
          alert(`Failed to book the appointment: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert(
          "An error occurred while booking the appointment. Please try again later."
        );
      }
    } else {
      alert(
        "The selected appointment slot is not available. Please choose another time."
      );
    }
  };

  return (
    <div className="appointment-form">
      <h1>Book an Appointment</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Appointment Date:</label>
          <input
            type="date"
            name="date"
            id="date"
            value={appointmentDetails.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="time">Appointment Time:</label>
          <input
            type="time"
            name="time"
            id="time"
            value={appointmentDetails.time}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="day">Day of the Week:</label>
          <select
            name="day"
            id="day"
            value={appointmentDetails.day}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Day</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>
        <button type="submit" className="submit-btn">
          Book Appointment
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
