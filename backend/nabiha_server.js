import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import oracledb from "oracledb";
const { connectionClass } = oracledb;

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
// hasnat 

// Oracle DB connection configuration
const dbConfig = {
  user: "dbms",
  password: "dbms",
  connectString: "localhost:1521/orcl",
};

// Endpoint to fetch calorie data
app.get("/calories", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "SELECT food_item, calories FROM food_calories"
    );
    console.log("Fetched food calorie data:", result.rows); // Debug log
    res.json(result.rows);
  } catch (err) {
    console.error("Error during fetching calorie data:", err);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

// Endpoint to fetch user data
app.get("/user-data/:date", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "SELECT * FROM user_data2 WHERE date_of_entry = :date_of_entry",
      { date_of_entry: req.params.date }
    );
    console.log("Fetched user data for date:", req.params.date, result.rows); // Debug log
    res.json(result.rows);
  } catch (err) {
    console.error("Error during fetching user data:", err);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

// Endpoint to calculate total calories
app.get("/user-data2/:date", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "SELECT SUM(calories) AS total_calories FROM user_data2 WHERE date_of_entry = :date_of_entry",
      { date_of_entry: req.params.date }
    );
    console.log("Total calories for date:", req.params.date, result.rows[0]); // Debug log
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error during fetching total calories:", err);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

// Endpoint to submit user data
app.post("/user-data", async (req, res) => {
  let connection;
  const { date_of_entry, foodItem, calories, servings } = req.body;
  const totalCalories = calories * servings;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `INSERT INTO user_data2 (date_of_entry, food_item, calories, servings) VALUES (:date_of_entry, :foodItem, :calories, :servings)`,
      {
        date_of_entry: date_of_entry,
        foodItem: foodItem,
        calories: totalCalories,
        servings: servings,
      },
      { autoCommit: true }
    );
    console.log("Inserted user data:", req.body); // Debug log
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error during submitting user data:", err);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

// Endpoint to delete user data
app.delete("/user-data", async (req, res) => {
  let connection;
  const { date_of_entry, foodItem } = req.body;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      "DELETE FROM user_data2 WHERE date_of_entry = :date_of_entry AND food_item = :foodItem",
      { date_of_entry: date_of_entry, foodItem: foodItem },
      { autoCommit: true }
    );
    console.log("Deleted the data", req.body);
    res.status(200).json({ message: "Data deleted successfully" });
  } catch (err) {
    console.error("Error during deleting user data:", err);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});
app.get("/medicine-options", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute("SELECT * FROM medicine");
    res.json(result.rows); // Send the data as JSON response
  } catch (err) {
    console.error("Error during fetching medicine data:", err);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

app.post("/medicine", async (req, res) => {
  const medicines = req.body.medicines; // Assuming medicines is an array in the request body
  const userId = req.body.userId; // Assuming the client includes userId in the request body
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const addedMedicines = [];

    for (const medicine of medicines) {
      // Fetch the medicine_code for the given medicine name
      const medicineCodeResult = await connection.execute(
        `SELECT medicine_code FROM medicine WHERE medicine_name = :name`,
        { name: medicine.name }
      );

      if (medicineCodeResult.rows.length === 0) {
        console.log(`No medicine code found for ${medicine.name}`);
        continue; // Skip this iteration if no medicine code is found
      }

      const medicineCode = medicineCodeResult.rows[0][0]; // Assuming medicine_code is the first column

      // Insert into medicinetracker with the fetched medicine_code and user_id
      const result = await connection.execute(
        `INSERT INTO medicinetracker (medicine_code, user_id, name, dosage, time) 
         VALUES (:medicine_code, :user_id, :name, :dosage, :time) 
         RETURNING id INTO :id`,
        {
          medicine_code: medicineCode,
          user_id: userId,
          name: medicine.name,
          dosage: medicine.dosage,
          time: medicine.time,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );

      addedMedicines.push({
        id: result.outBinds.id[0],
        medicine_code: medicineCode,
        user_id: userId,
        name: medicine.name,
        dosage: medicine.dosage,
        time: medicine.time
      });
    }

    res.status(201).json(addedMedicines);
  } catch (error) {
    console.error("Error inserting medicines:", error);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }
});

app.put("/medicine/:id", async (req, res) => {
  let connection;
  const prescriptionId = req.params.id; // Assuming you pass the index as the ID
  const { name, dosage, time } = req.body; // Assuming a single prescription object is passed

  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      "UPDATE medicinetracker SET name = :name, dosage = :dosage, time = :time WHERE id = :id",
      { id: prescriptionId, name, dosage, time },
      { autoCommit: true }
    );

    console.log("Updated prescription:", req.body);
    res.status(200).json({ message: "Prescription updated successfully" });
  } catch (error) {
    console.error("Error during updating prescription:", error);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

// Endpoint to delete a specific medicine
app.delete("/medicine/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      "DELETE FROM medicinetracker WHERE id = :id",
      { id: id },
      { autoCommit: true }
    );
    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (error) {
    console.error("Error deleting medicine:", error);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

app.post("/book-appointment", async (req, res) => {
  const { email, date, time, day } = req.body; // Expect `date` in 'YYYY-MM-DD' and `time` in 'HH24:MI:SS' format
  let connection;

  try {
    // Establish connection to the Oracle database
    connection = await oracledb.getConnection(dbConfig);

    // Fetch the BMDC number from the Doctors table using the provided email
    const doctorResult = await connection.execute(
      `SELECT BMDC FROM Doctors WHERE email = :email`,
      { email: email }
    );

    if (doctorResult.rows.length === 0) {
      res.status(404).json({ message: "Doctor not found with the given email" });
      return; // Stop further execution if no doctor is found
    }

    const bmdc = doctorResult.rows[0][0]; // Assuming BMDC is the first column

    // Combine `date` and `time` into a single `TIMESTAMP` for `appointment_timestamp`
    const appointmentTimestamp = `${date} ${time}`; // Combine date and time into 'YYYY-MM-DD HH24:MI:SS' format

    // Insert the new appointment into the Appointment table
    const sql = `
      INSERT INTO Appointment (appointment_id, BMDC, appointment_timestamp, day_of_week)
      VALUES (appointment_seq.nextval, :bmdc, TO_TIMESTAMP(:appointment_timestamp, 'YYYY-MM-DD HH24:MI:SS'), :day_of_week)
    `;

    // Execute the query with correct bind variables
    await connection.execute(
      sql,
      {
        bmdc: bmdc,
        appointment_timestamp: appointmentTimestamp,  // Correctly formatted TIMESTAMP input
        day_of_week: day,                             // Day of the week
      },
      { autoCommit: true }  // Commit the transaction
    );

    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
