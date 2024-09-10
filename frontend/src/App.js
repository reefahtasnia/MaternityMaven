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
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Shop from "./shop.js";
import Cart from "./cart.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          {<Route path="/" element={<Home />} />}
          <Route element={<PrivateComponent />}>
            <Route path="/Patient" element={<UserProfile />} />
            <Route path="/Medicinetracker" element={<MedicineTracker />} />
            <Route path="/Calorietracker" element={<CalorieTracker />} />
            <Route path="/Medicalhistory" element={<Medical />} />
            <Route path="/Appointment" element={<Appointment />} />
            <Route path="/Bookappointment" element={<BookAppointment />} />
          </Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/DoctorSignup" element={<DoctorSignup />} />
          <Route path="/Doctor" element={<DoctorProfile />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/shop" element={<Shop/>}/>
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
