import express, { response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import { connection, run_query } from "./connection.js";
import { sendEmail } from "./sendEmail.js";
import { emailService } from "./emailService.js";
import "./reminderService.js";
import oracledb from "oracledb";

dotenv.config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
//trying to change

const app = express();
const PORT = 5000;
const saltRounds = 10;

app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust this if your frontend address changes
  })
);

app.post("/api/signup", async (req, res) => {
  let { firstname, lastname, email, password, dob } = req.body;

  // Debug logs
  console.log("Received signup request with data:", req.body);

  let conn;
  try {
    // Open a new connection
    conn = await connection();
    console.log("Connection established successfully", conn);
    email = email.toUpperCase();
    // Check if user already exists
    const checkUserQuery = "SELECT * FROM Users WHERE email = :email";
    const result = await conn.execute(checkUserQuery, [email], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    if (result.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Insert new user
    const insertUserQuery = `
      INSERT INTO Users (firstname, lastname, email, date_of_birth)
      VALUES (UPPER(:firstname), UPPER(:lastname), UPPER(:email), TO_DATE(:dob, 'YYYY-MM-DD'))
      RETURNING userid INTO :userid`;

    // Debug log for bind variables
    console.log("Insert User Bind Variables:", {
      firstname,
      lastname,
      email,
      dob,
    });

    const userResult = await conn.execute(
      insertUserQuery,
      {
        firstname: firstname,
        lastname: lastname,
        email: email,
        dob: dob,
        userid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }, // Correctly configured for RETURNING INTO usage
      },
      { autoCommit: false }
    );

    const userId = userResult.outBinds.userid[0];
    await conn.execute("BEGIN UpdateUserAges; END;", [], { autoCommit: false });

    const hash = await bcrypt.hash(password, saltRounds);

    // Insert hashed password
    const insertPasswordQuery =
      "INSERT INTO Passwords (userid, hashed_password) VALUES (:userId, :hashedPassword)";

    // Debug log for password insertion
    console.log("Insert Password Bind Variables:", {
      userId,
      hashedPassword: hash,
    });

    await conn.execute(
      insertPasswordQuery,
      { userId, hashedPassword: hash },
      { autoCommit: false }
    );

    // Commit the transaction
    await conn.commit();

    res.status(201).json({ message: "User created successfully", userId });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    // Close the connection
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResults = await run_query(
      "SELECT userid FROM users WHERE email = UPPER(:email)",
      { email }
    );

    if (userResults.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(userResults[0]);
    const userid = userResults[0].USERID; // assuming userid is the first column in the SELECT
    console.log(userid);
    const passwordResult = await run_query(
      "SELECT hashed_password FROM passwords WHERE userid = :userid",
      { userid: userid }
    );

    console.log(passwordResult[0]);
    if (passwordResult.length === 0 || !passwordResult[0].HASHED_PASSWORD) {
      return res
        .status(404)
        .json({ message: "Password not set for this user" });
    }
    const hashed_password = passwordResult[0].HASHED_PASSWORD;
    console.log(hashed_password);
    const match = await bcrypt.compare(password, hashed_password);

    if (match) {
      res.status(201).json({
        message: "Login successful",
        userId: userid,
      });
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error during login process:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/secret", async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminResults = await run_query(
      "SELECT email FROM Admin WHERE email = UPPER(:email)",
      { email }
    );
    if (adminResults.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const adminEmail = adminResults[0].EMAIL;
    const passwordResults = await run_query(
      "SELECT hashed_password FROM Admin WHERE email = :email",
      { email: adminEmail }
    );
    if (passwordResults.length === 0 || !passwordResults[0].HASHED_PASSWORD) {
      return res
        .status(404)
        .json({ message: "Password not set for this admin" });
    }
    const hashed_password = passwordResults[0].HASHED_PASSWORD;
    console.log(hashed_password);
    if (hashed_password === password) {
      res.status(200).json({
        message: "Login successful",
        email: adminEmail,
      });
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error during admin login process:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/secret", async (req, res) => {
  const { email } = req.query;
  try {
    const adminResults = await run_query(
      "SELECT * FROM Admin WHERE email = UPPER(:email)",
      { email }
    );
    if (adminResults.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }
    console.log(adminResults);
    const data = adminResults;
    console.log("Fetching admin data");
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error("Error during admin search:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/user", async (req, res) => {
  const userId = req.query.userId;
  console.log(`Fetching user data for userId: ${userId}`); // Log the userId to debug

  if (!userId) {
    console.log("No userId provided");
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const query = "SELECT * FROM Users WHERE userid = UPPER(:userId)";
    const userResults = await run_query(query, { userId });
    console.log("User data retrieved:", userResults); // Log the result to debug

    if (userResults.length === 0) {
      console.log("No user found for the provided userId");
      return res.status(404).json({ message: "User not found" });
    }
    const data = userResults[0];
    console.log(data);
    res.json(data);
    console.log(res.json.data);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.post("/api/user/update", async (req, res) => {
  const {
    userId,
    firstname,
    lastname,
    email,
    dob,
    phone,
    bloodGroup,
    street,
    region,
    district,
    country,
  } = req.body;

  if (!firstname || !lastname) {
    console.log("First name and last name are required.");
    return res
      .status(400)
      .json({ message: "First name and last name are required." });
  }

  let formattedDob = new Date(dob).toISOString().slice(0, 10);

  let conn;
  try {
    conn = await connection();

    // Convert the address JS object to Oracle UDT
    const addressObj = {
      type: "ADDRESS_TYPE", // This should match the Oracle UDT name
      val: {
        STREET: street,
        REGION: region,
        DISTRICT: district,
        COUNTRY: country,
      },
    };

    const updateQuery = `
      UPDATE Users
      SET
        firstname = UPPER(:firstname),
        lastname = UPPER(:lastname),
        email = UPPER(:email),
        date_of_birth = TO_DATE(:dob, 'YYYY-MM-DD'),
        phone_number = :phone,
        blood_group = :bloodGroup,
        address = :addressObj
      WHERE userid = :userId
    `;

    const params = {
      userId,
      firstname,
      lastname,
      email,
      dob: formattedDob,
      phone,
      bloodGroup,
      addressObj,
    };

    console.log("Update query parameters:", params);
    const result = await conn.execute(updateQuery, params, {
      autoCommit: true,
    });

    console.log("Update result:", result);
    if (!result || result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made" });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error during profile update:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.toString() });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.post("/api/doctorSignup", async (req, res) => {
  const {
    regno,
    fullname,
    email,
    gender,
    phone,
    dept,
    mbbsYear,
    hosp,
    chamber,
    password,
    dob,
    total_operations, // Extract total_operations from the request
  } = req.body;

  if (
    !email ||
    !fullname ||
    !regno ||
    !mbbsYear ||
    !dob ||
    isNaN(total_operations)
  ) {
    console.log(email, fullname, regno, mbbsYear, dob, total_operations);
    return res
      .status(400)
      .json({ message: "Missing required fields or invalid input" });
  }

  console.log("Received signup request for", req.body);
  let conn;
  try {
    conn = await connection();

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }

    // Prepare to insert doctor's information
    const insertQuery = `
      INSERT INTO Doctors (BMDC, fullname, email, gender, phone, dept, mbbsYear, hosp, chamber, total_operations, date_of_birth)
      VALUES (UPPER(:BMDC), UPPER(:fullname), UPPER(:email), UPPER(:gender), UPPER(:phone), UPPER(:dept), :mbbsYear, UPPER(:hosp), UPPER(:chamber), :total_operations, :dob)
    `;

    const bindVars = {
      BMDC: regno,
      fullname,
      email,
      gender,
      phone,
      dept,
      mbbsYear,
      hosp,
      chamber,
      total_operations,
      dob: { val: dobDate, type: oracledb.DATE },
    };

    // Start a transaction to ensure both operations are executed successfully
    try {
      await conn.execute(insertQuery, bindVars, { autoCommit: false });
      await conn.execute(
        "BEGIN CalculateExperience(:BMDC); END;",
        { BMDC: regno },
        { autoCommit: false }
      );
      const hash = await bcrypt.hash(password, saltRounds);
      await conn.execute(
        "INSERT INTO Passwords (BMDC, hashed_password) VALUES (:BMDC, :hashedPassword)",
        { BMDC: regno, hashedPassword: hash },
        { autoCommit: false }
      );
      await conn.commit(); // Commit both the insertion and the experience calculation together
      res.status(201).json({ message: "Doctor registered successfully" });
    } catch (error) {
      console.error("Error during doctor signup:", error);
      await conn.rollback(); // Rollback the entire transaction if any part fails
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  } catch (error) {
    console.error("Error during doctor signup:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.post("/api/doctorLogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctorResults = await run_query(
      "SELECT BMDC FROM Doctors WHERE email = UPPER(:email)",
      { email }
    );

    console.log("Doctor Results:", doctorResults); // Log the results for debugging

    if (doctorResults.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const bmdc = doctorResults[0].BMDC; // Assuming BMDC is the first element in the array
    console.log("BMDC:", bmdc);

    const passwordResults = await run_query(
      "SELECT hashed_password FROM Passwords WHERE BMDC = :bmdc",
      { bmdc }
    );

    console.log("Password Results:", passwordResults); // Log the results for debugging

    if (passwordResults.length === 0 || !passwordResults[0].HASHED_PASSWORD) {
      return res
        .status(404)
        .json({ message: "Password not set for this doctor" });
    }

    const hashed_password = passwordResults[0].HASHED_PASSWORD;
    console.log("Hashed Password:", hashed_password);

    const match = await bcrypt.compare(password, hashed_password);

    if (match) {
      res.status(200).json({
        message: "Login successful",
        BMDC: bmdc,
      });
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error during doctor login process:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.get("/api/doctoruser", async (req, res) => {
  const { BMDC } = req.query;
  console.log(`Fetching doctor data for BMDC: ${BMDC}`);

  if (!BMDC) {
    return res.status(400).json({ message: "BMDC is required" });
  }

  try {
    const query = "SELECT * FROM Doctors WHERE BMDC = :BMDC";
    const results = await run_query(query, { BMDC });

    if (results.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctor = results[0];
    console.log("Doctor data retrieved:", doctor);
    res.json(doctor);
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.post("/api/doctor/update", async (req, res) => {
  const {
    BMDC,
    fullname,
    email,
    phone,
    dept,
    mbbsYear,
    totalOperations,
    hosp,
    chamber,
  } = req.body;

  let conn;
  try {
    conn = await connection();
    const plsql = `
      DECLARE
        v_oldMbbsYear VARCHAR2(4);
      BEGIN
        SELECT mbbsYear INTO v_oldMbbsYear FROM Doctors WHERE BMDC = :BMDC;

        UPDATE Doctors
        SET
          fullname = UPPER(:fullname),
          email = UPPER(:email),
          phone = UPPER(:phone),
          dept = UPPER(:dept),
          mbbsYear = :mbbsYear,
          total_operations = :totalOperations,
          hosp = UPPER(:hosp),
          chamber = UPPER(:chamber)
        WHERE BMDC = :BMDC;

        -- Check if mbbsYear has changed and call the procedure
        IF v_oldMbbsYear != :mbbsYear THEN
          CalculateExperience(:BMDC);
        END IF;

        COMMIT;
      END;
    `;

    await conn.execute(
      plsql,
      {
        BMDC,
        fullname,
        email,
        phone,
        dept,
        mbbsYear,
        totalOperations,
        hosp,
        chamber,
      },
      { autoCommit: false }
    );

    res.status(200).json({ message: "Doctor profile updated successfully" });
  } catch (error) {
    console.error("Error during doctor profile update:", error);
    res.status(500).json({ message: "Internal server error" });
    if (conn) await conn.rollback();
  } finally {
    if (conn) await conn.close();
  }
});

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  let conn;
  try {
    conn = await connection();
    let result = await conn.execute(
      "SELECT userid, email FROM Users WHERE email = UPPER(:email)",
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      const { USERID } = result.rows[0];
      const otp = await sendEmail(email, "Your OTP for Maternity Maven");
      return res
        .status(200)
        .json({ message: "OTP sent to your email", otp, userId: USERID });
    }

    // If not found in Users, check the Doctors table
    result = await conn.execute(
      "SELECT BMDC, email FROM Doctors WHERE email = UPPER(:email)",
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      const { BMDC } = result.rows[0];
      const otp = await sendEmail(email, "Your OTP for Maternity Maven");
      return res
        .status(200)
        .json({ message: "OTP sent to your email", otp, bmdc: BMDC });
    }

    // If not found in either table
    return res.status(404).json({ message: "User or Doctor not found" });
  } catch (error) {
    console.error("Error when checking user or sending email:", error);
    res
      .status(500)
      .json({ error: "Internal server error", error: error.toString() });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { password, userId, bmdc } = req.body;
  const saltRounds = 10;

  if (!password || (!userId && !bmdc)) {
    return res
      .status(400)
      .json({ message: "Password and either User ID or BMDC are required" });
  }

  try {
    let selectQuery;
    let selectParams;
    console.log(userId);
    if (userId) {
      selectQuery =
        "SELECT hashed_password FROM Passwords WHERE userid = :userId";
      selectParams = { userId };
    } else if (bmdc) {
      selectQuery = "SELECT hashed_password FROM Passwords WHERE BMDC = :bmdc";
      selectParams = { bmdc };
    }

    const currentPasswordResult = await run_query(selectQuery, selectParams);
    const currentPassword =
      currentPasswordResult.length > 0
        ? currentPasswordResult[0].HASHED_PASSWORD
        : null;
    console.log(currentPasswordResult);
    console.log(currentPassword);
    if (!currentPassword) {
      return res.status(404).json({ message: "User or Doctor not found" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let updateQuery;
    let updateParams;

    if (userId) {
      updateQuery =
        "UPDATE Passwords SET hashed_password = :hashedPassword WHERE userid = :userId";
      updateParams = { hashedPassword, userId };
    } else if (bmdc) {
      updateQuery =
        "UPDATE Passwords SET hashed_password = :hashedPassword WHERE BMDC = :bmdc";
      updateParams = { hashedPassword, bmdc };
    }

    await run_query(updateQuery, updateParams);

    const updatedPasswordResult = await run_query(selectQuery, selectParams);
    const updatedPassword =
      updatedPasswordResult.length > 0
        ? updatedPasswordResult[0].HASHED_PASSWORD
        : null;

    if (currentPassword === updatedPassword) {
      return res
        .status(500)
        .json({ message: "Password update failed, please try again." });
    }

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/medicine", async (req, res) => {
  console.log("Received request body:", req.body); // Log the incoming request body

  const { medicines, userId } = req.body; // Extract medicines and userId from the request body

  // Validate input
  if (!Array.isArray(medicines) || medicines.length === 0) {
    console.error("Medicines is not a valid array or is empty:", medicines);
    return res
      .status(400)
      .json({ message: "Invalid or missing 'medicines' array." });
  }

  if (!userId) {
    console.error("Missing userId in request body");
    return res
      .status(400)
      .json({ message: "Missing 'userId' in request body." });
  }

  let conn;
  try {
    conn = await connection(); // Establish database connection
    const addedMedicines = [];

    for (const medicine of medicines) {
      console.log(`Processing medicine: ${medicine.name}`); // Debugging

      // Fetch the medicine_code for the given medicine name
      const queryMedicineCode = `SELECT medicine_code FROM medicine WHERE lower(medicine_name) = lower(:name)`;
      const medicineCodeResult = await run_query(queryMedicineCode, {
        name: medicine.name,
      });

      if (medicineCodeResult.length === 0) {
        console.log(`No medicine code found for ${medicine.name}`);
        continue; // Skip this iteration if no medicine code is found
      }
      const medicineCode = medicineCodeResult[0].MEDICINE_CODE;
      // Insert into medicinetracker with the fetched medicine_code and user_id
      const insertQuery = `
        INSERT INTO medicinetracker (medicine_code, user_id, name, dosage, time)
        VALUES (:medicine_code, :user_id, :name, :dosage, :time)
        RETURNING id INTO :id`;

      const result = await conn.execute(
        insertQuery,
        {
          medicine_code: medicineCode,
          user_id: userId,
          name: medicine.name,
          dosage: medicine.dosage,
          time: medicine.time,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        },
        { autoCommit: false }
      ); // Auto commit is turned off to manage transactions manually

      const newId = result.outBinds.id[0];
      addedMedicines.push({
        id: newId,
        medicine_code: medicineCode,
        user_id: userId,
        name: medicine.name,
        dosage: medicine.dosage,
        time: medicine.time,
      });
    }

    await conn.commit(); // Commit the transaction after all insertions are done

    res.status(201).json(addedMedicines);
  } catch (error) {
    if (conn) {
      await conn.rollback(); // Rollback the transaction in case of an error
    }
    console.error("Error during medicine insertion:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }
});

app.put("/medicine-update/:id", async (req, res) => {
  const prescriptionId = req.params.id; // ID of the prescription to update
  const { name, dosage, time, userId } = req.body; // Extract userId from the request body
  console.log("Received request to update prescription:", req.body); // Debugging

  // Validate input
  if (!userId) {
    console.error("Missing userId in request body");
    return res
      .status(400)
      .json({ message: "Missing 'userId' in request body." });
  }

  let conn;
  try {
    conn = await connection(); // Establish database connection

    // Update prescription only if it matches the id and user_id
    const updateQuery = `
      UPDATE medicinetracker 
      SET name = :name, dosage = :dosage, time = :time 
      WHERE id = :id AND user_id = :userId`;

    const result = await conn.execute(
      updateQuery,
      { id: prescriptionId, name, dosage, time, userId },
      { autoCommit: false } // Turn off auto commit to manage transactions manually
    );

    if (result.rowsAffected === 0) {
      console.log("Prescription not found or not authorized for update");
      return res
        .status(404)
        .json({ message: "Prescription not found or not authorized" });
    }

    await conn.commit(); // Commit the transaction after the update is done
    console.log("Updated prescription:", req.body); // Debugging
    res.status(200).json({ message: "Prescription updated successfully" });
  } catch (error) {
    if (conn) {
      await conn.rollback(); // Rollback the transaction in case of an error
    }
    console.error("Error during updating prescription:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.close(); // Close the connection
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});
app.delete("/medicine/:id", async (req, res) => {
  const { id } = req.params; // ID of the prescription to delete
  const { userId } = req.body; // Extract userId from the request body
  console.log(req.body);
  console.log(
    `Received request to delete prescription with ID: ${id}, for user: ${userId}`
  ); // Debugging

  // Validate input
  // if (!userId) {
  //   console.error("Missing userId in request body");
  //   return res
  //     .status(400)
  //     .json({ message: "Missing 'userId' in request body." });
  // }

  let conn;
  try {
    conn = await connection(); // Establish database connection

    // Delete prescription only if it matches the id and user_id
    const deleteQuery = `
      DELETE FROM medicinetracker 
      WHERE id = :id`;

    const result = await conn.execute(
      deleteQuery,
      { id },
      { autoCommit: false } // Turn off auto commit to manage transactions manually
    );

    if (result.rowsAffected === 0) {
      console.log("Prescription not found or not authorized for deletion");
      return res
        .status(404)
        .json({ message: "Prescription not found or not authorized" });
    }

    await conn.commit(); // Commit the transaction after the deletion is done
    console.log(`Deleted prescription with ID: ${id}`); // Debugging
    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (error) {
    if (conn) {
      await conn.rollback(); // Rollback the transaction in case of an error
    }
    console.error("Error deleting medicine:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.close(); // Close the connection
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }
});

// Endpoint to count total operations for a user
// Endpoint to count total operations for a user
app.get("/api/medical-history/count-operations", async (req, res) => {
  const { userid } = req.query;
  let conn;
  try {
    conn = await connection();
    const result = await conn.execute(
      `SELECT COUNT(*) AS operation_count 
       FROM Medical_History 
       WHERE LOWER(treatment) LIKE '%operation%' 
       AND USER_ID = :userid`,
      [userid]
    );
    const operationCount = result.rows[0].OPERATION_COUNT;
    console.log("Operation count:", operationCount);
    res.json({ operationCount });
  } catch (err) {
    console.error("Error fetching operation count:", err);
    res.status(500).send("Error fetching operation count");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

// Endpoint to fetch medical history
app.get("/api/medical-history", async (req, res) => {
  const { userid } = req.query;
  console.log(userid);
  let conn;
  try {
    conn = await connection();
    const result = await conn.execute(
      "SELECT * FROM medical_history WHERE user_id = :userid",
      [userid]
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Endpoint to add medical history
app.post("/api/medical-history", async (req, res) => {
  const medicalHistory = req.body;
  let conn;
  try {
    conn = await connection();
    const insertPromises = medicalHistory.map((entry) =>
      conn.execute(
        "INSERT INTO Medical_History (user_id,year, incident, treatment) VALUES (:userid,:year, :incident, :treatment)",
        [entry.userid, entry.year, entry.incident, entry.treatment],
        { autoCommit: true }
      )
    );
    await Promise.all(insertPromises);
    res.status(200).send("Data inserted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting data");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});
app.post("/api/medical-history/delete", async (req, res) => {
  const { rows } = req.body;
  let conn;

  try {
    conn = await connection();
    console.log("Rows to delete:", rows);

    const deletePromises = rows.map((row) =>
      conn.execute(
        `DELETE FROM Medical_History
         WHERE year = :year AND incident = :incident AND treatment = :treatment
         AND treatment IN (
           SELECT treatment
           FROM medical_history
           WHERE treatment LIKE '%ongoing%'
           OR treatment LIKE '%upcoming%'
           OR treatment LIKE '%in progress%'
           OR treatment LIKE '%under way%'
           OR treatment LIKE '%proceeding%'
           OR treatment LIKE '%ing'
         )`,
        [row.year, row.incident, row.treatment],
        { autoCommit: true }
      )
    );

    const results = await Promise.all(deletePromises);
    console.log("Delete results:", results); // Debugging output

    res.status(200).send("Data deleted successfully");
  } catch (err) {
    console.error("Error deleting data", err);
    res.status(500).send("Error deleting data");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});
// Endpoint to add fetal movement data
app.post("/api/fetal-movement", async (req, res) => {
  console.log("Received fetal movement data :", req.body);
  const { user_id, baby_movement, duration, movement_date } = req.body;
  let conn;
  try {
    conn = await connection();
    await conn.execute(
      `INSERT INTO Fetal_Movement (user_id, baby_movement, duration, movement_date) 
       VALUES (:user_id, :baby_movement, :duration, TO_DATE(:movement_date, 'YYYY-MM-DD'))`,
      {
        user_id: user_id,
        baby_movement: baby_movement,
        duration: duration,
        movement_date: movement_date,
      },
      { autoCommit: true }
    );
    res.status(200).send("Fetal movement data inserted successfully");
  } catch (err) {
    console.error("Error inserting fetal movement data:", err);
    res.status(500).send("Error inserting data");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

// Endpoint to fetch fetal movement history
app.get("/api/fetal-movement/history", async (req, res) => {
  const { userid } = req.query;
  console.log(userid);
  let conn;
  try {
    conn = await connection();
    const result = await conn.execute(
      "SELECT * FROM Fetal_Movement WHERE user_id = :userid",
      [userid]
    );
    console.log("Query Result:", result);
    if (result.rows && result.rows.length > 0) {
      console.log("Fetched Rows:", result.rows);
      res.json(result.rows); // Send rows directly if they exist
    } else {
      console.log("No data found for this user.");
      res.json([]); // Return empty array if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.get("/api/doctors", async (req, res) => {
  const { search, sort } = req.query;
  let conn;
  console.log("received API request:", { search, sort });
  try {
    conn = await connection();

    // Basic query to fetch all doctors, with optional search and sorting
    let query = "SELECT * FROM Doctors";
    let params = [];

    // If search is provided, add WHERE clause to filter by name, department, or location
    if (search) {
      query += `
        WHERE LOWER(dept) LIKE :search 
        
      `;
      params.push(`%${search.toLowerCase()}%`);
    }

    // Add sorting if provided
    if (sort) {
      query += ` ORDER BY ${sort} DESC`;
    }
    console.log("Runnung query:", query, params);
    const result = await conn.execute(query, params);
    console.log("query result:", result.rows);
    res.json(result.rows || []);
    console.log(result.rows || []);
    console.log("out");
  } catch (err) {
    console.error("Error fetching doctors:", err);
    res.status(500).send("Error fetching doctors");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});
app.get("/api/departments", async (req, res) => {
  const { search } = req.query;
  let conn;
  console.log("search term received ibn API:", search);
  try {
    conn = await connection();

    // Query to fetch departments that match the search term
    let query =
      "SELECT DISTINCT dept FROM Doctors WHERE LOWER(dept) LIKE :search ";
    let params = [`${search.toLowerCase()}%`];

    const result = await conn.execute(query, params);
    console.log("Full query result:", result);
    console.log("Raw department results:", result.rows);
    const departments = result.rows.map((row) => row.DEPT); // Extract department names
    console.log("Returning departments:", departments);
    res.json(departments); // Send only the array of department names
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).send("Error fetching departments");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

// Route to get products
app.get("/api/products", async (req, res) => {
  let conn;
  try {
    conn = await connection();

    let result = await conn.execute(
      `BEGIN
         OPEN :cursor FOR
         SELECT * FROM PRODUCTS;
       END;`,
      {
        cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      }
    );

    let cursor = result.outBinds.cursor;
    let rows = [];
    let row;
    while ((row = await cursor.getRow())) {
      rows.push(row);
    }
    await cursor.close();
    res.json(rows);
    console.log("Fetched products using cursor:", rows);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/products-order", async (req, res) => {
  let conn;
  try {
    conn = await connection();

    const result = await conn.execute(
      "SELECT * FROM products ORDER BY PRODUCTID ASC"
    );
    console.log("Fetching products");
    console.log(result.rows[0]);
    return res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing database connection:", err);
      }
    }
  }
});

app.post("/api/cart", async (req, res) => {
  const { productId, title, price, quantity, userid } = req.body;
  console.log(userid); // Ensure this is safe to log
  console.log(req.body); // Ensure this is safe to log
  let conn;
  try {
    conn = await connection();
    const result = await conn.execute(
      "INSERT INTO cart (productid, user_id, title, price, quantity) VALUES ( :productId, :userid, :title, :price, :quantity)",
      { productId, userid, title, price, quantity },
      { autoCommit: true }
    );
    res.status(201).json({ message: "Product added to cart successfully" });
  } catch (err) {
    console.error("Error inserting into the cart table:", err);
    res.status(500).json({ error: "Error inserting into the cart table" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

app.get("/api/cart2", async (req, res) => {
  let conn;
  try {
    // Extract userId from the query parameters and convert it to a number if necessary
    const userId = parseInt(req.query.userId, 10); // Parse userId as an integer

    if (isNaN(userId)) {
      return res.status(400).send("Valid userId is required");
    }

    // Establish the connection to Oracle DB
    conn = await connection();

    // Execute the query to fetch all items from the cart for the given userId
    const result = await conn.execute(
      "SELECT * FROM cart WHERE user_id = :userId",
      { userId }, // Bind the userId variable
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Log the result to check the data structure
    console.log("Final Result: ", result.rows);

    // Send the result.rows directly as the response
    res.status(200).json(result.rows); // Use .json() to send it as JSON
  } catch (err) {
    console.error("Error fetching cart data:", err);
    res.status(500).send("Database Error");
  } finally {
    if (conn) {
      try {
        await conn.close(); // Close the connection
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.delete("/api/cart/:id", async (req, res) => {
  const productId = req.params.id;
  const userId = req.query.userId; // Access userId from query parameters

  console.log("Received productId:", productId, "and userId:", userId); // Debug log

  let conn;

  try {
    // Establish a connection
    conn = await connection();

    // Execute the delete query using both productId and userId
    const result = await conn.execute(
      "DELETE FROM cart WHERE productid = :productId AND user_id = :userId",
      { productId, userId },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Product removed from cart successfully" });
  } catch (err) {
    console.error("Error removing product from the cart table:", err);
    res
      .status(500)
      .json({ error: "Error removing product from the cart table" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

app.put("/api/cart/:id", async (req, res) => {
  const productId = req.params.id;
  const { change, userId } = req.body; // Expecting both productId and userId in the request

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  console.log("Updating product for user:", { productId, change, userId });

  let conn;

  try {
    // Establish a connection
    conn = await connection();

    // Update only the product for the specific user
    const result = await conn.execute(
      "UPDATE cart SET quantity = quantity + :change WHERE productid = :productId AND user_id = :userId",
      { change, productId, userId }, // Pass both productId and userId
      { autoCommit: true }
    );

    // Check if any rows were affected
    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Product not found in user's cart" });
    } else {
      res
        .status(200)
        .json({ message: "Product quantity updated successfully" });
    }
  } catch (err) {
    console.error("Error updating product quantity:", err);
    res.status(500).json({ error: "Error updating product quantity" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

async function generateUniqueOrderId(connection) {
  const min = 100000;
  const max = 999999;
  let unique = false;
  let orderId;

  while (!unique) {
    orderId = Math.floor(Math.random() * (max - min + 1)) + min;

    const result = await connection.execute(
      "SELECT count(*) FROM orders WHERE order_id = :orderId",
      { orderId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows[0]["COUNT(*)"] === 0) {
      unique = true;
    }
  }
  return orderId;
}

app.post("/api/order", async (req, res) => {
  const { cartItems, userId } = req.body;
  console.log("cartItems:", cartItems); // Log cart items
  console.log("userId:", userId);

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  let conn;
  console.log(cartItems, userId); // Optional logging for debugging

  try {
    // Establish a connection
    conn = await connection();

    // Generate a unique Order ID
    const orderId = await generateUniqueOrderId(conn);
    console.log("orderid:", orderId);

    // Insert each item from the cart into the orders table
    for (const item of cartItems) {
      await conn.execute(
        "INSERT INTO orders (user_id, order_id, productid, title, price, quantity) VALUES (:userId, :orderId, :productId, :title, :price, :quantity)",
        {
          userId,
          orderId,
          productId: item.PRODUCTID,
          title: item.TITLE,
          price: item.PRICE,
          quantity: item.QUANTITY,
        },
        { autoCommit: false } // Commit will be done later
      );
    }

    // Calculate total bill by summing price * quantity for each item in the order
    const result = await conn.execute(
      `SELECT SUM(price * quantity+50) AS total_bill
       FROM orders
       WHERE order_id = :orderId`,
      { orderId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const totalBill = result.rows[0].TOTAL_BILL;
    console.log("Total Bill:", totalBill);

    // Insert userId, orderId, and total bill into the Places table
    await conn.execute(
      "INSERT INTO Places (user_id, order_id, date_t, bill) VALUES (:userId, :orderId, SYSDATE, :totalBill)",
      {
        userId,
        orderId,
        totalBill,
      },
      { autoCommit: false }
    );

    // Commit the transaction
    await conn.commit();

    // Truncate the cart table
    await conn.execute(
      "DELETE FROM cart WHERE user_id = :userId",
      { userId: userId }, // Pass the bind variable properly
      { autoCommit: true }
    );

    // Respond with success and the generated order ID
    res.json({ success: true, orderId, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);

    // Rollback the transaction in case of any errors
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }

    res.status(500).json({ success: false, error: "Failed to place order" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.post("/api/add-products", async (req, res) => {
  const { productName, price, stock, productImage, category } = req.body;
  let conn;
  if(category=="Maternity Products") category="maternity";
  else if(category=="Baby Products & Toys") category="baby";
  else if(category=="food") category="food";
  else if(category=="clothes") category="clothes";
  try {
    console.log("Received request to add product:", req.body);
    conn = await connection();

    // Get the maximum productId to calculate the next productId
    const result = await conn.execute(
      `SELECT MAX(PRODUCTID) AS maxId FROM products`
    );
    const maxId = result.rows[0].MAXID || 0; // Default to 0 if no products are found
    const Id = maxId + 1;
    console.log(Id);
    // Insert the new product with productId incremented by 1
    const insertQuery = `
      INSERT INTO products (productId, product_name, price, stock, image, ctgr)
      VALUES (:productId, :productName, :price, :stock, :productImage, :ctgr)
    `;
    await conn.execute(
      insertQuery,
      {
        productId: Id,
        productName,
        price,
        stock,
        productImage,
        ctgr: category,
      },
      { autoCommit: true }
    );

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error during product addition:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

//orderhistory modal??

app.get("/api/orderdetails/:orderId", async (req, res) => {
  const { orderId } = req.params;

  let conn;
  try {
    // Establish a connection
    conn = await connection();

    // Query to fetch order and product details
    const result = await conn.execute(
      `SELECT 
          o.productid, 
          o.title, 
          o.price, 
          o.quantity, 
          p.image, 
          pl.order_id, 
          pl.date_t, 
          pl.bill
       FROM 
          places pl
       JOIN 
          orders o ON pl.order_id = o.order_id
       JOIN 
          products p ON o.productid = p.productid
       WHERE 
          pl.order_id = :orderId`,
      { orderId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      // Separate order details (assuming all rows will have the same order-level details)
      const orderInfo = {
        order_id: result.rows[0].ORDER_ID,
        date_t: result.rows[0].DATE_T,
        bill: result.rows[0].BILL,
      };

      // Collect all product details
      const orderItems = result.rows.map((row) => ({
        productid: row.PRODUCTID,
        title: row.TITLE,
        price: row.PRICE,
        quantity: row.QUANTITY,
        image: row.IMAGE,
      }));

      // Send response with order info and items
      res.json({
        success: true,
        order: orderInfo,
        orderItems: orderItems,
      });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching order details:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch order details" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.post("/api/update-quantity", async (req, res) => {
  const { productName, stock } = req.body;
  let conn;
  console.log(req.body);
  try {
    conn = await connection();

    // Update the stock of the specified product
    const updateQuery = `
      UPDATE products
      SET stock = :stock
      WHERE product_name = :productName
    `;
    const result = await conn.execute(
      updateQuery,
      {
        productName,
        stock,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.status(200).json({ message: "Stock updated successfully" });
    }
  } catch (error) {
    console.error("Error during stock update:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

//Endpoint for searching fooditems
app.get("/search-food-items", async (req, res) => {
  const { query } = req.query;
  let conn;
  try {
    conn = await connection();
    console.log("Received query:", query);

    const result = await conn.execute(
      `
      SELECT 
        f.food_name, 
        f.nutrition_details.calories
      FROM foodlist f 
      WHERE LOWER(f.food_name) LIKE LOWER(:query)
      `,
      { query: `%${query}%` } // Use named bind parameters for clarity and security
    );
    console.log("Raw result from database:", result);

    // Format the result to ensure it returns an array of objects with proper keys
    const formattedResult = result.rows.map((row) => ({
      food_name: row["FOOD_NAME"],
      calories: row["NUTRITION_DETAILS.CALORIES"],
    }));
    console.log("Formatted result: ", formattedResult);

    res.json(formattedResult);
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});
app.post("/calories", async (req, res) => {
  const { foodItem, userId, servings, calories, mealtype, date } = req.body;
  console.log("Received body: ", req.body);

  let conn;
  try {
    conn = await connection(); // Assuming you have a method to establish DB connection

    // Insert query to store the calorie tracking data
    const result = await conn.execute(
      `INSERT INTO Calorietracker (food_item, user_id, serving, calories, meal_type, entry_date, entry_time)
       VALUES (:foodItem, :userId, :servings, :calories, :mealtype, TO_DATE(:entry_date, 'YYYY-MM-DD'), SYSTIMESTAMP)`,
      {
        foodItem: foodItem,
        userId: userId,
        servings: servings,
        calories: calories,
        mealtype: mealtype,
        entry_date: date, // Renamed to avoid conflict
      },
      { autoCommit: true } // Commit automatically after successful execution
    );

    console.log("Insert result: ", result);

    // Send success response
    res.status(201).json({ message: "Calorie record added successfully." });
  } catch (error) {
    console.error("Error inserting calorie data:", error);

    // Send error response
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

app.get("/calorie-data/:date", async (req, res) => {
  let conn;
  const userId = req.query.userId;
  try {
    conn = await connection();
    const result = await conn.execute(
      "SELECT food_item, calories FROM Calorietracker WHERE entry_date = TO_DATE(:entry_date, 'YYYY-MM-DD') AND user_id = :userId",
      { entry_date: req.params.date, userId: userId }
    );
    const formattedResult = result.rows.map((row) => ({
      foodItem: row["FOOD_ITEM"], // Assuming the first column is food_item
      calories: row["CALORIES"], // Assuming the second column is calories
    }));

    console.log(
      "Fetched user data for date:",
      req.params.date,
      formattedResult
    );
    res.json(formattedResult); // Send the formatted response
  } catch (err) {
    console.error("Error during fetching user data:", err);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

app.get("/totalcal/:date", async (req, res) => {
  const { date } = req.params;
  const userId = req.query.userId;

  let conn;
  try {
    conn = await connection();
    const query = `
      SELECT SUM(calories) as total_calories 
      FROM Calorietracker 
      WHERE entry_date = TO_DATE(:entry_date, 'YYYY-MM-DD') AND user_id = :userId
    `;
    const result = await conn.execute(query, {
      entry_date: date,
      userId: userId,
    });

    // Ensure you extract the first item from the rows and get the total_calories
    const totalCalories =
      result.rows.length > 0 ? result.rows[0].TOTAL_CALORIES : 0;
    console.log("Total Calories:", totalCalories);

    // Send the totalCalories as JSON
    res.json({ total_calories: totalCalories });
  } catch (error) {
    console.error("Error fetching total calories:", error);
    res.status(500).json({ error: "Failed to fetch total calories" });
  } finally {
    if (conn) {
      await conn.close();
    }
  }
});

app.get("/getnutri/:food", async (req, res) => {
  const { food } = req.params; // Extract the food name from the request params
  let conn;

  try {
    // Establish a connection to the database
    conn = await connection();

    // Query to fetch the protein, carbohydrates, and fat details for the food item
    const query = `
      SELECT 
        f.nutrition_details.protein, 
        f.nutrition_details.carbohydrates, 
        f.nutrition_details.fat
      FROM 
        foodlist f 
      WHERE 
        LOWER(f.food_name) = LOWER(:food)
    `;

    // Execute the query, passing the food name as a parameter object
    const result = await conn.execute(query, { food });

    // Log the structure of result.rows for debugging purposes
    console.log(result.rows);

    const formattedResult = result.rows.map((row) => ({
      protein: row["NUTRITION_DETAILS.PROTEIN"], // Assuming the first column is food_item
      carbohydrates: row["NUTRITION_DETAILS.CARBOHYDRATES"],
      fat: row["NUTRITION_DETAILS.FAT"],
    }));

    console.log(
      "Fetched nutitional data:",

      formattedResult
    );
    res.json(formattedResult); // Send the formatted response
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Always close the database connection when done
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});
//Reefah Made changes below to display data in table in userprofile
app.get("/api/calorie-data", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const query = `
    SELECT ct.food_item, ct.calories, ct.meal_type, ct.serving, ct.entry_date,
           fn.NUTRITION_DETAILS.protein, fn.NUTRITION_DETAILS.carbohydrates, fn.NUTRITION_DETAILS.fat
    FROM Calorietracker ct
    JOIN foodlist fn ON UPPER(ct.food_item) = UPPER(fn.food_name)
    WHERE ct.user_id = :userId
  `;

  try {
    const results = await run_query(query, { userId: userId });
    const data = results.map((row) => ({
      date: row.ENTRY_DATE,
      calories: row.CALORIES,
      foodItem: row.FOOD_ITEM,
      mealType: row.MEAL_TYPE,
      servings: row.SERVING,
      protein: row["NUTRITION_DETAILS.PROTEIN"], // Access using the exact field names
      carbohydrates: row["NUTRITION_DETAILS.CARBOHYDRATES"], // Access using the exact field names
      fat: row["NUTRITION_DETAILS.FAT"], // Access using the exact field names
    }));
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching calorie data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/medicine-reminders", async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let conn;
  try {
    conn = await connection();
    const result = await conn.execute(
      `SELECT mt.name, mt.dosage, mt.time
           FROM MEDICINETRACKER mt
           WHERE mt.user_id = :userId
           ORDER BY mt.time ASC`,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error querying medicine reminders:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.get("/api/medicalhistory", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  console.log("Fetching medical history for user:", userId);
  let conn;
  try {
    conn = await connection();
    const query = `
      SELECT incident_year, incident, treatment, age_of_incident AS "Age of Incident"
      FROM MedicalHistoryView
      WHERE user_id = :userId
    `;
    const result = await conn.execute(query, { userId });
    console.log("result is" + result.rows[0].AGE_OF_INCIDENT);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch medical history from view:", error);
    res.status(500).json({ message: "Failed to fetch medical history" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

//for order history

app.get("/api/orders/:userId", async (req, res) => {
  const userId = req.params.userId;

  let conn;

  try {
    conn = await connection();

    // Query to get orders from the Places table
    const result = await conn.execute(
      `SELECT ORDER_ID, TO_CHAR(DATE_T, 'YYYY-MM-DD') as date_t, bill 
       FROM Places 
       WHERE user_id = :userId`,
      [userId]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders", err);
    res.status(500).send("Error fetching order history");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection", err);
      }
    }
  }
});
app.delete("/delfood", async (req, res) => {
  let conn;
  try {
    conn = await connection();
    //const { date, foodItem, mealtype, userId } = req.body;
    const { date, foodItem, userId } = req.body;
    console.log("Del ", req.body);

    const sql = `DELETE FROM calorietracker 
    WHERE LOWER(food_item) = LOWER(:food_item) 
    AND entry_date = TO_DATE(:entry_date, 'YYYY-MM-DD') 
    AND user_id = :user_id`;
    // const sql = `DELETE FROM calorietracker
    //                WHERE LOWER(food_item) = LOWER(:food_item)
    //                AND entry_date = TO_DATE(:entry_date, 'YYYY-MM-DD')
    //                AND user_id = :user_id
    //                AND meal_type = :meal_type`;

    // Use valid variable names that follow Oracle's conventions
    const binds = {
      food_item: foodItem, // Bind variable name with underscore
      entry_date: date, // Bind variable name with underscore
      user_id: userId,
      //meal_type: mealtype, // Bind variable name with underscore
    };

    // Establish a database connection

    const result = await conn.execute(sql, binds, { autoCommit: true });

    if (result.rowsAffected > 0) {
      res.status(200).send("Food entry deleted successfully");
    } else {
      res.status(404).send("No food entry found to delete");
    }

    await conn.close();
  } catch (err) {
    console.error("Error during deletion: ", err);
    res.status(500).send("Error deleting the food entry");
  }
});
app.post("/book-appointment", async (req, res) => {
  const { email, date, time, day, userId } = req.body;
  let conn;
  console.log(req.body);
  try {
    // Establish connection to the Oracle database
    conn = await connection();

    // Fetch the BMDC number from the Doctors table using the provided email
    const doctorResult = await conn.execute(
      `SELECT BMDC FROM Doctors WHERE email = :email`,
      { email: email }
    );

    if (doctorResult.rows.length === 0) {
      res
        .status(404)
        .json({ message: "Doctor not found with the given email" });
      return; // Stop further execution if no doctor is found
    }

    const bmdc = doctorResult.rows[0]?.BMDC; // Using optional chaining
    // Assuming BMDC is the first column
    // Combine `date` and `time` into a single `TIMESTAMP` for `appointment_timestamp`
    const appointmentTimestamp = `${date} ${time}`; // Combine date and time into 'YYYY-MM-DD HH24:MI:SS' format

    // Insert the new appointment into the Appointment table
    const sql = `
      INSERT INTO Appointment (appointment_id, user_id, BMDC_no, appointment_timestamp, day_of_week)
      VALUES (appointment_seq.nextval, :user_id, :bmdc, TO_TIMESTAMP(:appointment_timestamp, 'YYYY-MM-DD HH24:MI:SS'), :day_of_week)
    `;

    // Execute the query with correct bind variables
    await conn.execute(
      sql,
      {
        user_id: userId,
        bmdc: bmdc,
        appointment_timestamp: appointmentTimestamp, // Correctly formatted TIMESTAMP input
        day_of_week: day, // Day of the week
      },
      { autoCommit: true } // Commit the transaction
    );

    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ error: "Database query failed" });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});
app.post("/check-appointment", async (req, res) => {
  const { date, time, email, day, userId } = req.body;

  let conn;
  try {
    // Establish connection to the database
    conn = await connection();

    // Combine date and time into a single TIMESTAMP for querying
    const appointmentTimestamp = `${date} ${time}`;

    // Fetch the BMDC number using the provided email
    const doctorResult = await conn.execute(
      `SELECT BMDC FROM Doctors WHERE email = :email`,
      { email: email }
    );

    if (doctorResult.rows.length === 0) {
      res
        .status(404)
        .json({ message: "Doctor not found with the given email" });
      return; // Stop further execution if no doctor is found
    }

    const bmdc = doctorResult.rows[0]?.BMDC; // Accessing the BMDC value directly
    console.log("Check", bmdc);
    console.log(userId);

    // Query to check if the appointment slot is already booked
    const sql = `
      SELECT COUNT(*) as count
      FROM Appointment
      WHERE appointment_timestamp = TO_TIMESTAMP(:appointmentTimestamp, 'YYYY-MM-DD HH24:MI:SS')
      AND user_id = :userId
      AND BMDC_NO = :bmdc
      AND day_of_week = :day
    `;

    // Execute the query
    const result = await conn.execute(sql, {
      appointmentTimestamp,
      userId,
      bmdc,
      day,
    });

    // Check the result
    const count = result.rows[0].COUNT; // Use COUNT instead of count for Oracle
    if (count > 0) {
      // Slot is not available
      res
        .status(409)
        .json({ message: "The selected appointment slot is not available." });
    } else {
      // Slot is available
      res
        .status(200)
        .json({ message: "The selected appointment slot is available." });
    }
  } catch (error) {
    console.error("Error checking appointment availability:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking availability." });
  } finally {
    if (conn) {
      try {
        await conn.close(); // Ensure the connection is closed
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});

app.get("/api/appointments/:userId", async (req, res) => {
  const userId = req.params.userId;

  let conn;
  try {
    conn = await connection();
    const result = await conn.execute(
      `SELECT a.appointment_id, a.appointment_timestamp, a.day_of_week, d.fullname, d.email
       FROM Appointment a
       JOIN Doctors d ON a.BMDC_no = d.BMDC
       WHERE a.user_id = :userId`,
      { userId }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointments", err);
    res.status(500).send("Error fetching appointments");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection", err);
      }
    }
  }
});
// Fetch upcoming appointments
app.get("/api/upcoming-appointments", async (req, res) => {
  const { BMDC } = req.query;
  const query = `
    SELECT a.appointment_id, a.appointment_timestamp, a.day_of_week, u.fullname, u.email
    FROM Appointment a
    JOIN Users u ON a.user_id = u.userid
    WHERE a.BMDC_no = :BMDC AND a.appointment_timestamp > SYSDATE
    ORDER BY a.appointment_timestamp ASC
  `;
  try {
    let conn;
    conn = await connection();
    const result = await conn.execute(query, { BMDC });
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching upcoming appointments", err);
    res.status(500).send("Server error while fetching appointments");
  }
});

// Fetch past appointments
app.get("/api/past-appointments", async (req, res) => {
  const { BMDC } = req.query;
  const query = `
    SELECT a.appointment_id, a.appointment_timestamp, a.day_of_week, u.fullname, u.email
    FROM Appointment a
    JOIN Users u ON a.user_id = u.userid
    WHERE a.BMDC_no = :BMDC AND a.appointment_timestamp <= SYSDATE
    ORDER BY a.appointment_timestamp DESC
  `;
  try {
    let conn;
    conn = await connection();
    const result = await conn.execute(query, { BMDC });
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching past appointments", err);
    res.status(500).send("Server error while fetching appointments");
  }
});

///FEEDBACK ER API done

app.post("/api/feedback", async (req, res) => {
  const { description, rate, user_id, doctor_id } = req.body;
  console.log("Received feedback:", req.body);
  let conn;
  try {
    conn = await connection();
    const insertFeedbackQuery = `
      INSERT INTO Feedbacks (des, rate, user_id, doctor_id) 
      VALUES (:description, :rate, :user_id, :doctor_id)
    `;
    const result = await conn.execute(
      insertFeedbackQuery,
      {
        description,
        rate,
        user_id: user_id || null, // Ensure that null is passed if user_id is not set
        doctor_id: doctor_id || null, // Ensure that null is passed if doctor_id is not set
      },
      { autoCommit: true }
    );
    if (result) console.log("Feedback inserted successfully");
    else console.log("Feedback not inserted");
    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Error inserting feedback:", error);
    res.status(500).json({
      message: "An error occurred while submitting feedback.",
      error: error.message,
    });
  }
});
//display feedback in admin profile

// Utility to read CLOB data
async function readClob(clob) {
  return new Promise((resolve, reject) => {
    let data = "";
    clob.setEncoding("utf8");
    clob.on("data", (chunk) => {
      data += chunk;
    });
    clob.on("end", () => {
      resolve(data);
    });
    clob.on("error", (err) => {
      reject(err);
    });
  });
}
app.get("/api/feedback/details", async (req, res) => {
  const { type } = req.query;
  let query = "";
  if (type === "user") {
    query = `
      SELECT f.feedback_id, f.des AS description, f.rate, f.user_id, u.fullname, u.email
      FROM Feedbacks f
      JOIN Users u ON f.user_id = u.userid
    `;
  } else if (type === "doctor") {
    query = `
      SELECT f.feedback_id, f.des AS description, f.rate, f.doctor_id, d.fullname, d.email
      FROM Feedbacks f
      JOIN Doctors d ON f.doctor_id = d.BMDC
    `;
  } else {
    return res.status(400).json({ message: "Invalid type specified" });
  }

  try {
    const conn = await connection();
    const result = await conn.execute(query);
    const feedback = await Promise.all(
      result.rows.map(async (row) => {
        let description = "";
        if (row.DESCRIPTION) {
          // Assuming DESCRIPTION is a CLOB
          description = await readClob(row.DESCRIPTION);
        }
        return {
          feedback_id: row.FEEDBACK_ID,
          description,
          rate: row.RATE,
          user_or_doctor_id: type === "user" ? row.USER_ID : row.DOCTOR_ID,
          fullname: row.FULLNAME,
          email: row.EMAIL,
        };
      })
    );
    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/search-medicines", async (req, res) => {
  const { searchQuery } = req.query; // Use 'searchQuery' instead of 'query' for clarity
  console.log("Search Query:", searchQuery);

  // Check if the search query is provided and not empty
  if (!searchQuery || searchQuery.trim().length === 0) {
    return res.json([]); // Return an empty array if no search query is provided
  }

  let conn;
  try {
    // Assuming 'connection' is a function that returns a connected database client
    conn = await connection();

    // Using named parameters for safer queries
    const result = await conn.execute(
      `SELECT medicine_name 
       FROM medicine 
       WHERE LOWER(medicine_name) LIKE LOWER(:query)`,
      { query: `%${searchQuery}%` } // Ensure the '%' wildcards are included for partial matching
    );

    console.log("Fetched Medicines:", result.rows);

    // Extracting medicine names and returning them
    const medicines = result.rows.map((row) => row.MEDICINE_NAME);
    res.json(medicines); // Send back the list of medicine names
  } catch (error) {
    console.error("Failed to fetch medicines:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (conn) {
      try {
        // Make sure to close the database connection
        await conn.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});
app.get("/api/multiple-appointments", async (req, res) => {
  // Extract the BMDC of the logged-in doctor from the request
  const { BMDC } = req.query;

  if (!BMDC) {
    return res.status(400).json({ message: "BMDC number is required" });
  }

  let conn;
  try {
    conn = await connection(); // Make sure to establish a database connection

    // SQL query to find user IDs who have had more than one appointment with the doctor
    const sql = `
          SELECT u.userid, u.fullname, u.email, COUNT(*) as appointment_count
          FROM Users u
          JOIN Appointment a ON u.userid = a.user_id
          WHERE a.BMDC_no = :BMDC
          GROUP BY u.userid, u.fullname, u.email
          HAVING COUNT(*) > 1
      `;

    const result = await conn.execute(
      sql,
      { BMDC },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log("Fetched Results: " + JSON.stringify(result.rows, null, 2));

    if (result.rows.length > 0) {
      res.json({
        message: "Found users with multiple appointments",
        data: result.rows,
      });
    } else {
      res.status(404).json({
        message: "No users found with multiple appointments with this doctor",
      });
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ message: "Internal server error", error });
  } finally {
    if (conn) {
      try {
        await conn.close(); // Always ensure connections are closed after use
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});
app.get("/api/patient-details/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const conn = await connection();
    const query = `
      SELECT 
        u.userid,
        u.fullname,
        u.email,
        u.date_of_birth,
        u.blood_group,
        u.phone_number,
        mh.medical_history_details,
        fm.fetal_movement_details,
        mt.medicine_details,
        ct.calorie_details
      FROM Users u
      LEFT JOIN (
        SELECT user_id, LISTAGG(incident || ' - ' || treatment, '; ') WITHIN GROUP (ORDER BY year) AS medical_history_details
        FROM Medical_History
        GROUP BY user_id
      ) mh ON mh.user_id = u.userid
      LEFT JOIN (
        SELECT user_id, LISTAGG(baby_movement || ' - ' || duration || ' - ' || TO_CHAR(movement_date, 'DD/MM/YYYY'), '; ') WITHIN GROUP (ORDER BY movement_date DESC) AS fetal_movement_details
        FROM Fetal_Movement
        GROUP BY user_id
      ) fm ON fm.user_id = u.userid
      LEFT JOIN (
        SELECT user_id, LISTAGG(medicine_name || ' - ' || dosage || ' - ' || time, '; ') WITHIN GROUP (ORDER BY medicine_name) AS medicine_details
        FROM Medicinetracker
        JOIN Medicine ON Medicinetracker.medicine_code = Medicine.medicine_code
        GROUP BY user_id
      ) mt ON mt.user_id = u.userid
      LEFT JOIN (
        SELECT user_id, AVG(calories) AS calorie_details
        FROM Calorietracker
        GROUP BY user_id
      ) ct ON ct.user_id = u.userid
      WHERE u.userid = :userId`;

    const result = await conn.execute(
      query,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log(result.rows.data);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/medicine-tracker", async (req, res) => {
  const { userId } = req.query; // Extract userId from query parameters
  console.log("Fetching prescriptions for user:", userId);

  if (!userId) {
    return res
      .status(400)
      .json({ message: "Missing 'userId' query parameter" });
  }

  let conn;
  try {
    conn = await connection(); // Establish database connection

    // Query to fetch all prescriptions for the given userId
    const fetchQuery = `
      SELECT id, medicine_code, name, dosage, time 
      FROM medicinetracker 
      WHERE user_id = :userId
      `;

    const result = await conn.execute(fetchQuery, { userId });

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No prescriptions found for this user." });
    }

    //console.log(result);
    const prescriptions = result.rows.map((row) => ({
      id: row.ID,
      medicine_code: row.MEDICINE_CODE,
      name: row.NAME,
      dosage: row.DOSAGE,
      time: row.TIME,
    }));
    //console.log(prescriptions);
    res.status(200).json(prescriptions); // Return the fetched prescriptions
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    if (conn) {
      try {
        await conn.close(); // Close the connection
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }
});
