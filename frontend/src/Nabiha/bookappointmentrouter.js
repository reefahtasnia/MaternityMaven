import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import DoctorList from "./DoctorList";
import BookAppointment from "./bookappointment";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/doctors" />} />
        <Route path="/book-appointment/:email" element={<BookAppointment />} />
        <Route path="/doctors" element={<DoctorList />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
};

export default App;
