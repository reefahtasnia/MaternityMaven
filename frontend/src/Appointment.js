import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CSS/appointment.css";
import doctorImage from "./CSS/assets/doctor.jpg";
import { Link } from "react-router-dom";

function Appointment() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [sort, setSort] = useState("experience");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    console.log("triggered");
    fetchDoctors();
  }, [sort]); // Fetch doctors when sort changes

  const fetchDoctors = async () => {
    console.log("fetching doc");
    try {
      const response = await fetch(
        `http://localhost:5000/api/doctors?sort=${sort}`
      );
      console.log("respomse status:", response.status);
      if (!response.ok) {
        console.error("network response was not ok");
      }
      const data = await response.json();
      console.log("fetched data:", data);
      setDoctors(data);
      setResultCount(data.length);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleSearch = async () => {
    try {
      console.log("try");
      const response = await fetch(
        `http://localhost:5000/api/doctors?search=${search}&sort=${sort}`
      );
      const data = await response.json();
      console.log("in");
      setDoctors(data);
      setResultCount(data.length); // Update result count
      setShowSuggestions(false); // Hide suggestions after search
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleInputChange = async (e) => {
    const input = e.target.value;
    setSearch(input);

    if (input.length > 0) {
      const fetchUrl = `http://localhost:5000/api/departments?search=${input}`;
      console.log("Fetching suggestions from:", fetchUrl); // Log the URL
      try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        const fetchedSuggestions = await response.json();
        console.log("Fetched suggestions:", fetchedSuggestions);
        setSuggestions(fetchedSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]); // Clear suggestions if input is empty
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion);
    setSuggestions([]); // Clear suggestions after a selection
    setShowSuggestions(false);
  };

  return (
    <Container>
      <h1 className="text-center mt-4">Doctors</h1>
      <Form className="mb-4">
        <Row>
          <Col md={8}>
            {/* Updated search-box structure */}
            <div className="search-box">
              <Form.Control
                type="text"
                placeholder="Search by department"
                value={search}
                onChange={handleInputChange}
                className="search-input"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-container">
                  {suggestions.map((suggestion, index) => (
                    <p
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Col>
          <Col md={2}>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
          </Col>
          <Col md={2}>
            <DropdownButton id="dropdown-basic-button" title="Sort By">
              <Dropdown.Item onClick={() => setSort("experience")}>
                Experience
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSort("total_operations")}>
                Total Operations
              </Dropdown.Item>
            </DropdownButton>
          </Col>
        </Row>
      </Form>

      <h4 className="text-center">Search Result ({resultCount})</h4>
      <Row>
        {doctors.map((doctor, index) => (
          <Col md={6} key={index} className="mb-4">
            <Card>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <img
                      src={doctorImage}
                      alt="Doctor"
                      className="img-fluid rounded-circle"
                    />
                  </Col>
                  <Col md={9}>
                    <Card.Title>{doctor.FULLNAME}</Card.Title>
                    <Card.Text>
                      <strong>Department:</strong> {doctor.DEPT}
                      <br />
                      <strong>Location:</strong> {doctor.HOSP}
                      <br />
                      <strong>Experience:</strong> {doctor.EXPERIENCE} years
                      <br />
                      <strong>Total Operations:</strong>{" "}
                      {doctor.TOTAL_OPERATIONS}
                      <br />
                      <strong>Phone Number:</strong> {doctor.PHONE}
                      <br />
                    </Card.Text>
                    <Link
                      to={`/book-appointment/${encodeURIComponent(
                        doctor.EMAIL
                      )}`}
                    >
                      Book Appointment
                    </Link>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Appointment;
