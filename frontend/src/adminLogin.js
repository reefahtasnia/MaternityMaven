import React, { useState } from "react";
import "./CSS/login.css";
import backgroundImage from "./CSS/assets/pinkpg2.jpg";

const Secret = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/secret`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data.message === "Login successful") {
          alert("Login successful!");
          localStorage.setItem("admin",JSON.stringify({email}));
          window.location.href = "/Admin"; 
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during login");
      });
  };

  return (
    <div
      className="center-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="wrapper">
        <h1>LOG IN</h1>
        <form id="loginForm" onSubmit={handleLogin}>
          <div className="input-box">
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
              required
            />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
            />
            <i className="bx bxs-lock-alt"></i>
          </div>
          <button type="submit" className="btn" id="loginbtn">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Secret;
