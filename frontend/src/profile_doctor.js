import React, { useEffect, useState } from "react";
import "./CSS/userprofile.css";

const DoctorProfile = () => {
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/150");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("");
  const [mbbsYear, setMBBSyear] = useState("");
  const [totalOperations, setTotalOperations] = useState(0);
  const [experience, setExperience] = useState(0);
  const [pracChamber, setPracChamber] = useState("");
  const [hosp, setHosp] = useState("");
  const [storedauth, setAuth] = useState(null);
  const triggerFileInput = () => {
    document.getElementById("fileInput").click();
  };
  const capitalizeWords = (string) => {
    return string.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  };
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("user"));
    setAuth(auth);
    if (auth && auth.BMDC) {
      const url = `http://localhost:5000/api/doctoruser?BMDC=${auth.BMDC}`;
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP status ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setFullName(capitalizeWords(data.FULLNAME) || "");
          setEmail(data.EMAIL.toLowerCase() || "");
          setPhone(data.PHONE || "");
          setDept(capitalizeWords(data.DEPT) || "");
          setMBBSyear(data.MBBSYEAR || "");
          setTotalOperations(data.TOTAL_OPERATIONS || 0);
          setExperience(data.EXPERIENCE || 0);
          setPracChamber(capitalizeWords(data.CHAMBER) || "");
          setHosp(capitalizeWords(data.HOSP) || "");
        })
        .catch((error) => {
          console.error("Failed to fetch doctor data:", error);
          alert(`Failed to load doctor data: ${error.message}`);
        });
        fetchProfileImage(auth.BMDC);
    }
  }, []);

  const fetchProfileImage = async (bmdc) => {
    try {
      const imageUrl = `http://localhost:3001/api/doctor-image/${bmdc}`;
      const response = await fetch(imageUrl);
      if (response.ok) {
        console.log("Profile image found:", imageUrl);
        setProfileImage(imageUrl);
      } else {
        console.log('No profile image found, using default');
        setProfileImage("https://via.placeholder.com/150");
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
      setProfileImage("https://via.placeholder.com/150");
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.jpg')) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bmdc", storedauth.BMDC);

        try {
          const response = await fetch("http://localhost:3001/api/upload-doctor-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload image: ${response.statusText}`);
          }

          const result = await response.json();
          if (result) alert("Doctor profile image uploaded successfully");
          fetchProfileImage(storedauth.BMDC); // Fetch the new image after successful upload
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Error uploading file: " + error.message);
        }
      } else {
        alert("Please select a .jpg file for upload.");
      }
    }
  };

  const handleSave = () => {
    const auth = JSON.parse(localStorage.getItem("user"));
    if (auth && auth.BMDC) {
      const updatedDoctor = {
        BMDC: auth.BMDC,
        fullname: fullName,
        email: email,
        phone: phone,
        dept: dept,
        mbbsYear: mbbsYear,
        totalOperations: totalOperations, 
        hosp: hosp,
        chamber: pracChamber,
      };

      console.log("Saving updated doctor data:", updatedDoctor);

      fetch(`http://localhost:5000/api/doctor/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDoctor),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Response not OK");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Update response data:", data);
          alert("Profile updated successfully");
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred during profile update");
        });
    }
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
          </div>
        </div>
        <div className="profile-details">
          <h3 className="profile-section-title">Doctor Profile Details</h3>
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
              <label className="profile-detail-label">Department</label>
              <input
                type="text"
                className="profile-detail-input"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">
                MBBS Completion Year
              </label>
              <input
                type="text"
                className="profile-detail-input"
                value={mbbsYear}
                onChange={(e) => setMBBSyear(e.target.value)}
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
              <label className="profile-detail-label">Current Hospital</label>
              <input
                type="text"
                className="profile-detail-input"
                value={hosp}
                onChange={(e) => setHosp(e.target.value)}
              />
            </div>
            <div className="profile-detail">
              <label className="profile-detail-label">Practicing Chamber</label>
              <input
                type="text"
                className="profile-detail-input"
                value={pracChamber}
                onChange={(e) => setPracChamber(e.target.value)}
              />
            </div>
            <div className="profile-detail">
          <label className="profile-detail-label">Total Operations</label>
          <input
            type="number"
            className="profile-detail-input"
            value={totalOperations}
            onChange={(e) => setTotalOperations(e.target.value)}
          />
        </div>
        <div className="profile-detail">
          <label className="profile-detail-label">Years of Experience</label>
          <input
            type="number"
            className="profile-detail-input"
            value={experience}
            readOnly // This field should be read-only
          />
        </div>
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Current Patients</h3>
          <button className="profile-section-button">Edit</button>
          <div className="profile-section-content">
            <p>Currently empty.</p>
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Upcoming Appointments</h3>
          <button className="profile-section-button">Add</button>
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

export default DoctorProfile;
