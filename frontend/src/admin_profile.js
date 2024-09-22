import React, { useEffect, useState } from "react";
import "./CSS/adminprofile.css"; // Adjust the path as necessary
import { FaShoppingCart } from "react-icons/fa";

const AdminProfile = () => {
  const auth = JSON.parse(localStorage.getItem("user"));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [products, setProducts] = useState([]);
  const [feedback, setFeedback] = useState([]);
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
        } catch (error) {
          console.error("Failed to fetch data:", error.message);
          alert(`Failed to load data: ${error.message}`);
        }
      };
      const fetchProductData=async()=>{
        try{
            const productDataUrl = `http://localhost:5000/api/products`;
            const productResponse = await fetch(productDataUrl);
            if (!productResponse.ok) {
                throw new Error(`HTTP status ${productResponse.status}`);
            }
            const productData = await productResponse.json();
            console.log("Fetched product data:", productData);
        } catch (error) {
            console.error("Failed to fetch data:", error.message);
            alert(`Failed to load data: ${error.message}`);
        }
    };
      fetchUserData();
    }
  }, []); // Empty dependency array to run only once on component mount

  const setProfileData = (data) => {
    try {
      setFullName(
        capitalizeWords(`${data.FIRSTNAME || ""} ${data.LASTNAME || ""}`)
      );
      setEmail(data.EMAIL ? data.EMAIL.toLowerCase() : "");
      setPhone(data.PHONE_NUMBER || "");
    } catch (error) {
      console.error("Error setting profile data:", error);
    }
  };
  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-header-info">
            <h2 className="profile-name">{fullName || "John Doe"}</h2>
            <p className="profile-email">{email || "johndoe@gmail.com"}</p>
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
              <label className="profile-detail-label">Phone Number</label>
              <input
                type="tel"
                className="profile-detail-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Products</h3>
          <button
            className="profile-section-button"
            onClick={() => (window.location.href = "/Medicinetracker")}
          >
            Edit
          </button>
          <div className="profile-section-content">
            <ul className="profile-section-list">
              {products.map((product) => (
                <li key={product.id} className="profile-section-item">
                  <span>{product.name}</span>
                  <span>{product.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Feedback reports</h3>
          <button
            className="profile-section-button"
            onClick={() => (window.location.href = "/Calorietracker")}
          >
            Edit
          </button>
          <div className="profile-section-content"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
