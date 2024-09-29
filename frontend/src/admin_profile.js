import React, { useEffect, useState } from "react";
import "./CSS/userprofile.css";

const AdminProfile = () => {
  const auth = JSON.parse(localStorage.getItem("admin"));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [products, setProducts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [feedbackType, setFeedbackType] = useState("user"); 
  const capitalizeWords = (string) => {
    return string.toLowerCase().replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  };
  useEffect(() => {
    if (auth) {
      const fetchUserData = async () => {
        try {
          // Fetch user data
          const userDataUrl = `http://localhost:5000/api/secret?email=${auth.email}`;
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
      const fetchProductData = async () => {
        try {
          const productDataUrl = `http://localhost:5000/api/products-order`;
          const productResponse = await fetch(productDataUrl);
          if (!productResponse.ok) {
            throw new Error(`HTTP status ${productResponse.status}`);
          }
          const productData = await productResponse.json();
          console.log("Fetched product data:", productData);
          setProducts(productData);
        } catch (error) {
          console.error("Failed to fetch product data:", error);
          alert(`Failed to load product data: ${error.message}`);
        }
      };
      const fetchFeedbackData = async (type) => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/feedback/details?type=${type}`
          );
          if (!response.ok) throw new Error(`HTTP status ${response.status}`);
          const data = await response.json();
          console.log(data);
          setFeedback(data);
        } catch (error) {
          console.error("Failed to fetch feedback data:", error);
        }
      };
      fetchFeedbackData(feedbackType);
      fetchUserData();
      fetchProductData();
    }
  }, [feedbackType]); // Empty dependency array to run only once on component mount

  const setProfileData = (data) => {
    try {
      setFullName(capitalizeWords(data[0].NAME));
      setEmail(data[0].EMAIL.toLowerCase());
      setPhone(data[0].PHONE_NO || "");
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
            onClick={() => (window.location.href = "/Add-product")}
          >
            Edit
          </button>
          <div className="profile-section-content">
            {products.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={`product-${product.PRODUCTID}-${index}`}>
                      <td>{product.PRODUCTID}</td>
                      <td>{product.PRODUCT_NAME}</td>
                      <td>{product.PRICE}</td>
                      <td>{product.STOCK}</td>
                      <td>{product.CTGR}</td>
                      <td>
                        <img
                          src={product.IMAGE}
                          alt={product.PRODUCT_NAME}
                          style={{ width: "100px" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No products available</p>
            )}
          </div>
        </div>
        <div className="profile-section">
          <h3 className="profile-section-title">Feedback reports</h3>
          <select
            className="feedback-type-dropdown"
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            <option value="user">User Feedback</option>
            <option value="doctor">Doctor Feedback</option>
          </select>
          <button
            className="profile-section-button"
            // onClick={() => (window.location.href = "/Calorietracker")}
          >
            Edit
          </button>
          <div className="profile-section-content">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Rate</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f, index) => (
                  <tr key={`feedback-${f.feedback_id}-${index}`}>
                    <td>{f.feedback_id}</td>
                    <td>{f.fullname}</td>
                    <td>{f.email}</td>
                    <td>{f.rate}</td>
                    <td>{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
