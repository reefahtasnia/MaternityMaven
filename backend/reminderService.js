import cron from "node-cron";
import { emailService } from "./emailService.js";
import dotenv from "dotenv";
import { connection } from "./connection.js";
dotenv.config();
// Schedule a job to run every minute
console.log("Initializing reminder service...");
cron.schedule("* * * * *", async () => {
  let conn;
  try {
    conn = await connection(); // Get your database connection
    console.log("Running cron job");

    // Fetch users and their prescriptions in one query
    const query = `
      SELECT u.userId, u.email, m.name, m.dosage, m.time 
      FROM users u, medicinetracker m 
      where 
      u.userid = m.user_id`;

    const result = await conn.execute(query);
    const rows = result.rows; // Assuming this returns an array of user and prescription data
    //console.log(rows);

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    console.log("Current time", currentTime);
    console.log("Prescription time: ", time);

    // Group prescriptions by userId
    const prescriptionsByUser = {};
    rows.forEach((row) => {
      const { userId, email, medicine_name, dosage, time } = row;
      console.log("Bhitorer row", row);
      console.log(email);

      if (!prescriptionsByUser[userId]) {
        prescriptionsByUser[userId] = {
          email,
          prescriptions: [],
        };
      }

      prescriptionsByUser[userId].prescriptions.push({
        medicine_name,
        dosage,
        time,
      });
    });

    // Send reminders
    for (const userId in prescriptionsByUser) {
      const userData = prescriptionsByUser[userId];
      const { email, prescriptions } = userData;

      prescriptions.forEach((prescription) => {
        const { medicine_name, dosage, time } = prescription;

        // Check if the prescription time matches the current time
        if (time === currentTime) {
          const subject = "Medicine Reminder";
          const text = `Hi, it's time to take your medicine: ${medicine_name}. Dosage: ${dosage}. Time: ${time}.`;

          emailService(email, subject, text)
            .then(() => console.log(`Reminder sent to ${email}`))
            .catch((error) => console.error(`Failed to send email: ${error}`));
        }
      });
    }
  } catch (error) {
    console.error("Error fetching users or prescriptions:", error);
  } finally {
    if (conn) {
      try {
        await conn.close(); // Ensure connection is closed
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
});
