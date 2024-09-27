import React from "react";
import Navbar from "./Nav.js";
import Home from "./Home";
import Signup from "./signup";
import Login from "./login";
import UserProfile from "./patient_profile";
import PrivateComponent from "./PrivateComponent";
import DoctorSignup from "./doctorsignup.js";
import DoctorProfile from "./profile_doctor.js";
import ForgotPassword from "./forgetpassword.js";
import ResetPassword from "./resetPassword.js";
import OTP from "./OTP.js";
import MedicineTracker from "./medicine.js";
import CalorieTracker from "./calorie.js";
import Medical from "./Medical.js";
import Appointment from "./Appointment.js";
import BookAppointment from "./bookappointment.js";
import Shop from "./shop.js";
import Cart from "./cart.js";
import Fetal from "./fetal.js";
import OrderDetails from "./order_history.js";
import Dashboard from "./dashboard.js";
import Admin from "./admin_profile.js";
import Secret from "./adminLogin.js";
import Feedback from "./feedback.js";
import AdminPrivateComponent from "./AdminPrivateComponent.js";
import AddProduct from "./addProduct.js";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const isAuthenticated = localStorage.getItem('user'); // Check if user is authenticated
  const userType = localStorage.getItem('userType'); 
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                userType === "doctor" ? (
                  <Navigate to="/Doctor" />
                ) : (
                  <Dashboard />
                )
              ) : (
                <Home />
              )
            }
          />
          {isAuthenticated && userType === "doctor" ? (
            // Routes for doctors
            <Route element={<PrivateComponent />}>
              <Route path="/Doctor" element={<DoctorProfile />} />
              <Route path="/feedback" element={<Feedback />} />
            </Route>
          ) : (
            // Routes for other authenticated users
            <Route element={<PrivateComponent />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/Patient" element={<UserProfile />} />
              <Route path="/Medicinetracker" element={<MedicineTracker />} />
              <Route path="/Calorietracker" element={<CalorieTracker />} />
              <Route path="/Medicalhistory" element={<Medical />} />
              <Route path="/fetal" element={<Fetal />} />
              <Route path="/Appointment" element={<Appointment />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route
                path="/book-appointment/:email"
                element={<BookAppointment />}
              />
              <Route path="/shop" element={<Shop />} />
              <Route path="/orderdetails" element={<OrderDetails />} />
              <Route path="/cart" element={<Cart />} />
            </Route>
          )}
          <Route element={<AdminPrivateComponent />}>
            <Route path="/Admin" element={<Admin />} />
            <Route path="/add-product" element={<AddProduct />} />
          </Route>
          <Route path="/secret" element={<Secret />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/DoctorSignup" element={<DoctorSignup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/reset" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
