import React, { useEffect, useState } from "react";
import "./CSS/medicine.css";

const MedicineTracker = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", time: "" },
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

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
  console.log("Retrieved userId:", userId);

  useEffect(() => {
    console.log("UseEffect retrieved userId:", userId);
  }, [userId]);

  const handleMedicineChange = async (index, event) => {
    const { name, value } = event.target;
    const newMedicines = medicines.map((medicine, i) => {
      if (i !== index) return medicine;
      return { ...medicine, [name]: value };
    });
    setMedicines(newMedicines);

    const searchQuery = value; // The current input value
    console.log("Search Query:", searchQuery);

    if (name === "name" && searchQuery.length > 1) {
      try {
        const response = await fetch(
          `http://localhost:5000/search-medicines?searchQuery=${searchQuery}`
        );
        const data = await response.json();
        console.log("Fetched medicine suggestions:", data);
        setSuggestions(data.map((item) => item.medicine_name)); // Ensure correct key
      } catch (error) {
        console.error("Error fetching medicine suggestions:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMedicines((prevMedicines) =>
      prevMedicines.map((medicine, index) => {
        if (index === editIndex) {
          return { ...medicine, name: suggestion };
        }
        return medicine;
      })
    );
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      { name: "", dosage: "", time: "", userid: userId },
    ]);
  };

  const handleRemoveMedicine = (index) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleEditPrescription = (index) => {
    const prescriptionToEdit = prescriptions[index];
    setMedicines([
      {
        name: prescriptionToEdit.name,
        dosage: prescriptionToEdit.dosage,
        time: prescriptionToEdit.time,
      },
    ]);
    setEditIndex(index);
    setIsFormVisible(true);
  };

  const handleRemovePrescription = (index) => {
    const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updatedPrescriptions);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { userId: userId, medicines: medicines };
    console.log("Submitting payload:", payload);

    try {
      const responsePost = await fetch("http://localhost:5000/medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (responsePost.ok) {
        const data = await responsePost.json();
        setPrescriptions([...prescriptions, ...data]);
        setSubmitted(true);
        clearForm();
        setIsFormVisible(false);
      } else {
        alert("Error submitting data.");
      }
    } catch (error) {
      console.error("Error submitting user data:", error);
    }
  };

  const clearForm = () => {
    setMedicines([{ name: "", dosage: "", time: "" }]);
    setSuggestions([]);
  };

  return (
    <div className="medicine-tracker-bg">
      <div className="appointment-form">
        <h1>Medicine Tracker</h1>
        <button
          className="check-availability"
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            clearForm();
          }}
        >
          +
        </button>
      </div>

      {isFormVisible && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h2>
              {editIndex !== null ? "Edit Prescription" : "Add Prescription"}
            </h2>
            <div className="medicine-list">
              {medicines.map((medicine, index) => (
                <div key={index} className="medicine-item">
                  <div className="form-group">
                    <label htmlFor={`name-${index}`}>
                      Name of the medicine:
                    </label>
                    <input
                      type="text"
                      id={`name-${index}`}
                      name="name"
                      value={medicine.name}
                      onChange={(event) => handleMedicineChange(index, event)}
                      autoComplete="off"
                      required
                    />
                    {suggestions.length > 0 && (
                      <ul className="suggestions-list">
                        {suggestions.map((item) => (
                          <li
                            key={item}
                            onClick={() => handleSuggestionClick(item)}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor={`dosage-${index}`}>Dosage:</label>
                    <input
                      type="text"
                      id={`dosage-${index}`}
                      name="dosage"
                      value={medicine.dosage}
                      onChange={(event) => handleMedicineChange(index, event)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`time-${index}`}>Time:</label>
                    <input
                      type="time"
                      id={`time-${index}`}
                      name="time"
                      value={medicine.time}
                      onChange={(event) => handleMedicineChange(index, event)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveMedicine(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-btn"
              onClick={handleAddMedicine}
            >
              Add Another Medicine
            </button>
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </form>
        </div>
      )}

      {/* Render Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="prescriptions-list">
          <h2>Your Prescriptions:</h2>
          {prescriptions.map((prescription, index) => (
            <div key={index} className="prescription-box">
              <div>
                <strong>Name:</strong> {prescription.name}
              </div>
              <div>
                <strong>Dosage:</strong> {prescription.dosage}
              </div>
              <div>
                <strong>Time:</strong> {prescription.time}
              </div>
              <button
                className="remove-prescription-btn"
                onClick={() => handleRemovePrescription(index)}
              >
                Remove
              </button>
              <button
                className="edit-prescription-btn"
                onClick={() => handleEditPrescription(index)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineTracker;
