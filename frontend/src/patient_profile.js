import React, { useEffect, useState } from "react";
import "./CSS/userprofile.css"; // Adjust the path as necessary
import { FaShoppingCart } from "react-icons/fa";
import { useHistory } from "react-router-dom";

const UserProfile = () => {
  const auth = JSON.parse(localStorage.getItem("user"));
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/150"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [street, setStreet] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [country, setCountry] = useState("");
  const [calorieData, setCalorieData] = useState([]);
  const [hasFetchedCalorieData, setHasFetchedCalorieData] = useState(false);
  const [medicineReminders, setMedicineReminders] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const capitalizeWords = (string) => {
    return string.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  };
  useEffect(() => {
    if (auth && auth.userId) {
      const fetchUserData = async () => {
        try {
          // Fetch user data
          const userDataUrl = `http://localhost:5000/api/user?userId=${auth.userId}`;
          const userResponse = await fetch(userDataUrl);
          if (!userResponse.ok) {
            throw new Error(`HTTP status ${userResponse.status}`);
          }
          const userData = await userResponse.json();
          console.log("Fetched user data:", userData);
          setProfileData(userData);

          // Fetch calorie data if not already fetched
          if (!hasFetchedCalorieData) {
            const calorieDataUrl = `http://localhost:5000/api/calorie-data?userId=${auth.userId}`;
            const calorieResponse = await fetch(calorieDataUrl);
            if (!calorieResponse.ok) {
              throw new Error(`HTTP status ${calorieResponse.status}`);
            }
            const fetchedCalorieData = await calorieResponse.json();
            console.log("Fetched calorie data:", fetchedCalorieData);
            setCalorieData(fetchedCalorieData);
            setHasFetchedCalorieData(true);
          }
        } catch (error) {
          console.error("Failed to fetch data:", error.message);
          alert(`Failed to load data: ${error.message}`);
        }
      };
      const fetchMedicineReminders = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/medicine-reminders?userId=${auth.userId}`
          );
          if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
          }
          const data = await response.json();
          setMedicineReminders(data);
        } catch (error) {
          console.error("Failed to fetch medicine reminders:", error.message);
        }
      };
      const fetchMedicalHistory = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/medicalhistory?userId=${auth.userId}`
          );
          if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
          }
          const data = await response.json();
          console.log("Fetched medical history:", data);
          if (data.length === 0) {
            console.log(
              "No medical history entries found for user:",
              auth.userId
            );
          }
          setMedicalHistory(data);
        } catch (error) {
          console.error("Failed to fetch medical history:", error.message);
        }
      };
      fetchUserData();
      fetchMedicineReminders();
      fetchMedicalHistory();
    }
  }, []); // Empty dependency array to run only once on component mount

  const setProfileData = (data) => {
    try {
      // Assuming `ADDRESS` is null, handle address gracefully if it's present later
      const address = data.ADDRESS || {};

      setFullName(
        capitalizeWords(`${data.FIRSTNAME || ""} ${data.LASTNAME || ""}`)
      );
      setEmail(data.EMAIL ? data.EMAIL.toLowerCase() : "");
      setDob(
        data.DATE_OF_BIRTH
          ? new Date(data.DATE_OF_BIRTH).toISOString().slice(0, 10)
          : ""
      );
      setPhone(data.PHONE_NUMBER || "");
      setBloodGroup(data.BLOOD_GROUP || "");

      // If `ADDRESS` is null, these fields will be set to empty
      setStreet(capitalizeWords(address.STREET || ""));
      setRegion(capitalizeWords(address.REGION || ""));
      setDistrict(capitalizeWords(address.DISTRICT || ""));
      setCountry(capitalizeWords(address.COUNTRY || ""));
    } catch (error) {
      console.error("Error setting profile data:", error);
    }
  };

  const triggerFileInput = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    const nameParts = fullName.trim().split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ");

    const updatedUser = {
      userId: auth.userId,
      firstname,
      lastname,
      email,
      dob,
      phone,
      bloodGroup,
      street,
      region,
      district,
      country,
    };

    console.log("Saving updated user data:", updatedUser);

    fetch(`http://localhost:5000/api/user/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Response not OK");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Update response data:", data);
        if (data.success) {
          alert("Profile updated successfully");
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during profile update");
      });
  };
  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              id="profileImage"
              className="profile-image"
              src={profileImage}
              alt="User Avatar"
            />
            <button
              type="button"
              onClick={triggerFileInput}
              className="profile-image-upload-button"
            >
              <svg
                className="icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
            <input
              type="file"
              id="fileInput"
              className="input-hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div className="profile-header-info">
            <h2 className="profile-name">{fullName || "John Doe"}</h2>
            <p className="profile-email">{email || "johndoe@gmail.com"}</p>
            <button
              className="my-cart-button"
              onClick={() => (window.location.href = "/cart")}
            >
              <FaShoppingCart className="cart-icon" />
              My Cart
            </button>
          </div>
        </div>
        <div className="profile-details">
          <h3 className="profile-section-title">Profile Details</h3>
          <div className="profile-details-grid">
            <div className="profile-detail">
              <label className="profile-detail-label">Full Name</label>
              <input
                type="text"
                className="profile-detail-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">Email</label>
              <input
                type="email"
                className="profile-detail-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">Date of Birth</label>
              <input
                type="date"
                className="profile-detail-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">Phone Number</label>
              <input
                type="tel"
                className="profile-detail-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">Blood Group</label>
              <input
                type="text"
                className="profile-detail-input"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              />
            </div>

            <div className="profile-detail">
              <label className="profile-detail-label">
                House No. & Road No.
              </label>
              <input
                type="text"
                className="profile-detail-input"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">Area</label>
              <input
                type="text"
                className="profile-detail-input"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">District</label>
              <input
                type="text"
                className="profile-detail-input"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">Country</label>
              <input
                type="text"
                className="profile-detail-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Medicine Reminders</h3>
          <button
            className="profile-section-button"
            onClick={() => (window.location.href = "/Medicinetracker")}
          >
            Edit
          </button>
          <div className="profile-section-content">
            {medicineReminders.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dosage</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {medicineReminders.map((item, index) => (
                    <tr key={index}>
                      <td>{item.MEDICINE_NAME}</td>
                      <td>{item.DOSAGE}</td>
                      <td>
                        {new Date(
                          "1970-01-01T" + item.TIME + "Z"
                        ).toLocaleTimeString("en-US", { timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No upcoming reminders.</p>
            )}
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Calories Intake</h3>
          <button
            className="profile-section-button"
            onClick={() => (window.location.href = "/Calorietracker")}
          >
            Edit
          </button>
          <div className="profile-section-content">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Food Item</th>
                  <th>Calories</th>
                  <th>Meal Type</th>
                  <th>Servings</th>
                  <th>Protein (g)</th>
                  <th>Carbs (g)</th>
                  <th>Fat (g)</th>
                </tr>
              </thead>
              <tbody>
                {calorieData.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>{capitalizeWords(entry.foodItem)}</td>
                    <td>{entry.calories}</td>
                    <td>{entry.mealType}</td>
                    <td>{entry.servings}</td>
                    <td>{entry.protein}</td>
                    <td>{entry.carbohydrates}</td>
                    <td>{entry.fat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Medical History</h3>
          <button
            className="profile-section-button"
            onClick={() => (window.location.href = "/Medicalhistory")}
          >
            Edit
          </button>
          <div className="profile-section-content">
            {medicalHistory.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Year of Incident</th>
                    <th>Incident</th>
                    <th>Treatment</th>
                    <th>Age of Incident</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalHistory.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.INCIDENT_YEAR}</td>
                      <td>{entry.INCIDENT}</td>
                      <td>{entry.TREATMENT}</td>
                      <td>{entry["Age of Incident"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No medical history found.</p>
            )}
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Upcoming Appointments</h3>
          <button
            className="profile-section-button"
            onClick={() => (window.location.href = "/Appointment")}
          >
            Add
          </button>
          <div className="profile-section-content">
            <p>No upcoming appointments.</p>
          </div>
        </div>
        <div className="profile-actions">
          <button className="profile-action-button delete-button">
            Delete Account
          </button>
          <button
            className="profile-action-button save-button"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
