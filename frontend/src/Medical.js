import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CSS/medical.css";

const Medical = () => {
  const auth = JSON.parse(localStorage.getItem("user"));
  const initialRow = {
    year: "",
    incident: "",
    treatment: "",
    userid: auth.userId,
  };

  const [medicalHistory, setMedicalHistory] = useState([initialRow]);
  const [viewHistory, setViewHistory] = useState(false);
  const [fullHistory, setFullHistory] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [operationCount, setOperationCount] = useState(0);

  const fetchOperationCount = useCallback(async () => {
    console.log("Fetching operation count...");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/medical-history/count-operations?userid=${auth.userId}`
      );
      console.log("Operation count API response:", response.data);

      if (typeof response.data.operationCount === "number") {
        setOperationCount(response.data.operationCount);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching operation count", error);
    }
  }, [auth.userId]);
  // useCallback to memoize the fetchFullHistory function to prevent re-creation on every render
  const fetchFullHistory = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/medical-history?userid=${auth.userId}`
      );
      console.log(response);
      setFullHistory(response.data);
      setViewHistory(true);
    } catch (error) {
      console.error("Error fetching full medical history", error);
    }
  }, [auth.userId]);

  useEffect(() => {
    if (auth.userId) {
      fetchOperationCount();
      fetchFullHistory();
    }
  }, [auth.userId, fetchOperationCount, fetchFullHistory]);

  const handleAddRow = () => {
    setMedicalHistory([...medicalHistory, { ...initialRow }]);
  };

  const handleChange = (index, field, value) => {
    const updatedHistory = medicalHistory.map((entry, idx) => {
      if (index === idx) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    setMedicalHistory(updatedHistory);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const filledRows = medicalHistory.filter(
      (row) => row.year || row.incident || row.treatment
    );

    if (filledRows.length > 0) {
      try {
        await axios.post(
          "http://localhost:5000/api/medical-history",
          filledRows
        );
        setMedicalHistory([initialRow]);
        fetchOperationCount();
      } catch (error) {
        console.error("Error saving medical history", error);
      }
    } else {
      alert("Please fill in at least one row before saving.");
    }
  };

  const handleDelete = async () => {
    const rowsToDelete = selectedRows.map((index) => ({
      userid: fullHistory[index].USER_ID, // Correct property access
      year: fullHistory[index].YEAR,
      incident: fullHistory[index].INCIDENT,
      treatment: fullHistory[index].TREATMENT,
    }));

    if (rowsToDelete.length > 0) {
      try {
        await axios.post("http://localhost:5000/api/medical-history/delete", {
          rows: rowsToDelete,
        });
        fetchFullHistory(); // Refresh the history after deletion
        fetchOperationCount(); // Refresh the operation count
        setSelectedRows([]); // Clear selected rows
      } catch (error) {
        console.error("Error deleting medical history", error);
      }
    } else {
      alert("No rows selected for deletion.");
    }
  };

  const toggleRowSelection = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear; year >= 1900; year--) {
    yearOptions.push(
      <option key={year} value={year}>
        {year}
      </option>
    );
  }

  return (
    <div className="medical_history">
      <div className="container mt-4">
        <div className="card">
          <div className="card-header">
            <h3>Medical History</h3>
            <h4>Total Operations: {operationCount}</h4>
          </div>
          <div className="card-body">
            {viewHistory ? (
              <div>
                <h4>Full Medical History</h4>
                <table className="table table-striped blue-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Year</th>
                      <th>Incident</th>
                      <th>Treatment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullHistory.length > 0 ? (
                      fullHistory.map((entry, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(index)}
                              onChange={() => toggleRowSelection(index)}
                            />
                          </td>
                          <td>{entry.YEAR}</td> {/* Access YEAR */}
                          <td>{entry.INCIDENT}</td> {/* Access INCIDENT */}
                          <td>{entry.TREATMENT}</td> {/* Access TREATMENT */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No medical history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between mt-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setViewHistory(false)}
                  >
                    Back
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    Delete Selected
                  </button>
                </div>
              </div>
            ) : (
              <form id="medical-history-form" onSubmit={handleSave}>
                <table className="table table-striped blue-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Incident</th>
                      <th>Treatment</th>
                    </tr>
                  </thead>
                  <tbody id="medicalHistoryTableBody">
                    {medicalHistory.map((entry, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-input"
                            value={entry.year}
                            onChange={(e) =>
                              handleChange(index, "year", e.target.value)
                            }
                          >
                            <option value="">Select Year</option>
                            {yearOptions}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            value={entry.incident}
                            onChange={(e) =>
                              handleChange(index, "incident", e.target.value)
                            }
                            placeholder="Incident"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            value={entry.treatment}
                            onChange={(e) =>
                              handleChange(index, "treatment", e.target.value)
                            }
                            placeholder="Treatment"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between mt-2">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleAddRow}
                  >
                    Add Row
                  </button>
                  <div>
                    <button type="submit" className="btn btn-success">
                      Save
                    </button>
                    <button
                      className="btn btn-info ml-2"
                      type="button"
                      onClick={fetchFullHistory}
                    >
                      View History
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medical;
