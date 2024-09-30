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
  const [editIndex, setEditIndex] = useState(null); // Track the index being edited
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null); // Track prescription ID for updating

  // Get user details from local storage (or wherever it is stored)
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

  // Fetch prescriptions from the backend when the component mounts
  useEffect(() => {
    if (userId) {
      console.log("Fetching prescriptions for user:", userId);
      const fetchPrescriptions = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/medicine-tracker?userId=${userId}` // Fixed interpolation with backticks
          );
          if (response.ok) {
            const data = await response.json();
            setPrescriptions(data); // Assuming data is an array of prescriptions
          } else {
            console.error("Error fetching prescriptions:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching prescriptions:", error);
        }
      };
      fetchPrescriptions();
    }
  }, [userId]);

  const handleMedicineChange = async (index, event) => {
    const { name, value } = event.target;
    const newMedicines = medicines.map((medicine, i) => {
      if (i !== index) return medicine;
      return { ...medicine, [name]: value };
    });
    setMedicines(newMedicines);

    if (name === "name" && value.length > 1) {
      try {
        const response = await fetch(
          `http://localhost:5000/search-medicines?searchQuery=${value}` // Fixed interpolation with backticks
        );
        const data = await response.json();
        setSuggestions(data.map((item) => item[0])); // Ensure correct key
      } catch (error) {
        console.error("Error fetching medicine suggestions:", error);
        setSuggestions([]); // Clear suggestions on error
      }
    } else {
      setSuggestions([]); // Clear suggestions if input is too short
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
    setEditingPrescriptionId(prescriptionToEdit.id); // Store the prescription ID being edited
    setIsFormVisible(true);
  };

  const handleRemovePrescription = async (index) => {
    const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updatedPrescriptions);

    const prescriptionToRemove = prescriptions[index];
    try {
      const response = await fetch(
        `http://localhost:5000/medicine/${prescriptionToRemove.id}`, // Fixed interpolation with backticks
        { method: "DELETE" }
      );
      if (!response.ok) {
        console.error("Error deleting prescription:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting prescription:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editingPrescriptionId !== null) {
      // If editing, call the edit submission logic
      await handleEditSubmit();
    } else {
      // Otherwise, perform the normal create logic
      const payload = { userId: userId, medicines: medicines };

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
    }
  };

  const handleEditSubmit = async () => {
    // Edit existing prescription
    const updatedMedicine = medicines[0]; // Since we allow editing one prescription at a time

    try {
      const response = await fetch(
        `http://localhost:5000/medicine-update/${editingPrescriptionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updatedMedicine.name,
            dosage: updatedMedicine.dosage,
            time: updatedMedicine.time,
            userId: userId, // Make sure userId is passed
          }),
        }
      );

      if (response.ok) {
        // Update the local prescriptions state
        const updatedPrescriptions = prescriptions.map((prescription) =>
          prescription.id === editingPrescriptionId
            ? { ...prescription, ...updatedMedicine }
            : prescription
        );
        setPrescriptions(updatedPrescriptions);
        setSubmitted(true);
        clearForm();
        setIsFormVisible(false);
        setEditingPrescriptionId(null); // Reset the edit state
      } else {
        alert("Error updating prescription.");
      }
    } catch (error) {
      console.error("Error updating prescription:", error);
    }
  };

  const clearForm = () => {
    setMedicines([{ name: "", dosage: "", time: "" }]);
    setSuggestions([]); // Clear suggestions when the form is cleared
    setEditIndex(null);
  };

  return (
    <div className="medicine-tracker-bg">
      <div className="medicine-tracker">
        <h1>Medicine Tracker</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <h2>
            {editIndex !== null ? "Edit Prescription" : "Add Prescription"}
          </h2>
          <div className="medicine-list">
            {medicines.map((medicine, index) => (
              <div key={index} className="medicine-item">
                <div className="form-group">
                  <label htmlFor={`name-${index}`}>Name of the medicine:</label>
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
                    <div className="suggestions-container">
                      {suggestions.map((item, index) => (
                        <p
                          key={`${item.medicine_name}-${index}`}
                          onClick={() => handleSuggestionClick(item)}
                        >
                          {item.medicine_name}
                        </p>
                      ))}
                    </div>
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
              </div>
            ))}
          </div>
          <button type="submit" className="submit-btn">
            {editIndex !== null ? "Update Prescription" : "Submit"}
          </button>
        </form>
      </div>

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
