// emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or any other email service you're using
  auth: {
    user: process.env.EMAIL_USER, // Your email user
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

// Function to send email
export const emailService = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to, // List of receivers
    subject, // Subject line
    text, // Plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};
