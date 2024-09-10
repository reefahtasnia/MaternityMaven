import React from "react";
import { Link } from "react-router-dom";

const DoctorList = ({ doctors }) => {
  // Example list of doctors (replace with actual data fetching)
  const exampleDoctors = [
    {
      id: 1,
      name: "Dr. John Doe",
      specialty: "Cardiology",
      email: "johndoe@example.com",
    },
    {
      id: 2,
      name: "Dr. Jane Smith",
      specialty: "Dermatology",
      email: "janesmith@example.com",
    },
  ];

  return (
    <div>
      <h1>Doctor List</h1>
      {exampleDoctors.map((doctor) => (
        <div key={doctor.id}>
          <h3>{doctor.name}</h3>
          <p>Specialty: {doctor.specialty}</p>
          <Link to={`/book-appointment/${encodeURIComponent(doctor.email)}`}>
            Book Appointment
          </Link>
        </div>
      ))}
    </div>
  );
};

export default DoctorList;
