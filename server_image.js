const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const oracledb = require("oracledb");
const { connection, run_query } = require("./connection.js");
const { Lob } = oracledb;

const app = express();
const PORT = 3001;

app.use(express.static(path.join(__dirname, "frontend", "public")));
app.use(cors({ origin: "http://localhost:3000" }));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "frontend", "public", "assets");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname);
    const filename = `temp_${uniqueSuffix}${fileExt}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// Function to insert image into Oracle database
async function insertImageIntoDatabase(userId, filename, mimeType, imagePath) {
  let conn;
  try {
    conn = await connection();
    const imageBuffer = await fs.promises.readFile(imagePath);

    const sql = `
      INSERT INTO user_images (user_id, filename, mime_type, image_data)
      VALUES (:userId, :filename, :mimeType, :imageData)
    `;

    const result = await conn.execute(
      sql,
      {
        userId: userId,
        filename: filename,
        mimeType: mimeType,
        imageData: { val: imageBuffer, type: oracledb.BLOB },
      },
      { autoCommit: true }
    );

    console.log("Image inserted into database successfully");
  } catch (err) {
    console.error("Error inserting image into database:", err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing database connection:", err);
      }
    }
  }
}

// File upload route
app.post("/api/upload-image", upload.single("file"), async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = req.body.userId;
  const oldPath = req.file.path;
  const fileExt = path.extname(req.file.originalname);
  const newFilename = `${userId}_profile_pic${fileExt}`;
  const newPath = path.join(path.dirname(oldPath), newFilename);

  try {
    await fs.promises.rename(oldPath, newPath);
    const filePath = `/assets/${newFilename}`;
    console.log("File uploaded and renamed successfully:", filePath);

    // Insert image into Oracle database
    await insertImageIntoDatabase(
      userId,
      newFilename,
      req.file.mimetype,
      newPath
    );

    res.json({ filePath: filePath });
  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).json({ message: "Error processing file" });
  }
});

app.get("/api/user-image/:userId", async (req, res) => {
  let conn;
  try {
    conn = await connection();
    const sql = `SELECT image_data, mime_type FROM user_images WHERE user_id = :userId AND ROWNUM = 1`;
    const binds = { userId: req.params.userId };
    const result = await conn.execute(sql, binds);
    if (result.rows.length > 0) {
      const [lob, mimeType] = result.rows[0];
      console.log('Sending image with MIME type:', mimeType);
      
      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', 'inline');
  
      lob.on('end', () => console.log('Finished sending image data'));
      lob.pipe(res);
    } else {
      console.log('No image found for user:', req.params.userId);
      res.status(404).send("Image not found");
    }
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).send("Server error");
    // Close the connection if an error occurred
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection: ", err);
      }
    }
  }
});
async function insertDoctorImageIntoDatabase(bmdc, filename, mimeType, imagePath) {
  let conn;
  try {
    conn = await connection();
    const imageBuffer = await fs.promises.readFile(imagePath);

    const sql = `
      INSERT INTO doctor_images (bmdc, filename, mime_type, image_data)
      VALUES (:bmdc, :filename, :mimeType, :imageData)
    `;

    const result = await conn.execute(
      sql,
      {
        bmdc: bmdc,
        filename: filename,
        mimeType: mimeType,
        imageData: { val: imageBuffer, type: oracledb.BLOB },
      },
      { autoCommit: true }
    );

    console.log("Doctor image inserted into database successfully");
  } catch (err) {
    console.error("Error inserting doctor image into database:", err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing database connection:", err);
      }
    }
  }
}

// Doctor image upload route
app.post("/api/upload-doctor-image", upload.single("file"), async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const bmdc = req.body.bmdc;
  const oldPath = req.file.path;
  const fileExt = path.extname(req.file.originalname);
  const newFilename = `${bmdc}_profile_pic${fileExt}`;
  const newPath = path.join(path.dirname(oldPath), newFilename);

  try {
    await fs.promises.rename(oldPath, newPath);
    const filePath = `/assets/${newFilename}`;
    console.log("Doctor file uploaded and renamed successfully:", filePath);

    // Insert doctor image into Oracle database
    await insertDoctorImageIntoDatabase(
      bmdc,
      newFilename,
      req.file.mimetype,
      newPath
    );

    res.json({ filePath: filePath });
  } catch (err) {
    console.error("Error processing doctor file:", err);
    res.status(500).json({ message: "Error processing doctor file" });
  }
});

// Get doctor image route
app.get("/api/doctor-image/:bmdc", async (req, res) => {
  let conn;
  try {
    conn = await connection();
    const sql = `SELECT image_data, mime_type FROM doctor_images WHERE bmdc = :bmdc AND ROWNUM = 1`;
    const binds = { bmdc: req.params.bmdc };
    const result = await conn.execute(sql, binds);
    if (result.rows.length > 0) {
      const [lob, mimeType] = result.rows[0];
      console.log('Sending doctor image with MIME type:', mimeType);
      
      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', 'inline');
  
      lob.on('end', () => console.log('Finished sending doctor image data'));
      lob.pipe(res);
    } else {
      console.log('No doctor image found for BMDC:', req.params.bmdc);
      res.status(404).send("Doctor image not found");
    }
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).send("Server error");
    // Close the connection if an error occurred
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection: ", err);
      }
    }
  }
});

app.post("/api/upload-doctor-nid-image", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const bmdc = req.body.bmdc;
  const oldPath = req.file.path;
  const fileExt = path.extname(req.file.originalname);
  const newFilename = `${bmdc}_NID_image${fileExt}`;
  const newPath = path.join(path.dirname(oldPath), newFilename);

  try {
    await fs.promises.rename(oldPath, newPath);
    console.log("NID file uploaded and renamed successfully:", newPath);

    // Insert NID image into Oracle database in the doctor_nid_images table
    await insertNIDImageIntoDatabase(bmdc, newFilename, req.file.mimetype, newPath);

    res.json({ filePath: `/assets/${newFilename}` });
  } catch (err) {
    console.error("Error processing NID file:", err);
    res.status(500).json({ message: "Error processing NID file" });
  }
});

async function insertNIDImageIntoDatabase(bmdc, filename, mimeType, imagePath) {
  let conn;
  try {
    conn = await connection();
    const imageBuffer = await fs.promises.readFile(imagePath);

    const sql = `
      INSERT INTO doctor_nid_images (bmdc, filename, mime_type, image_data)
      VALUES (:bmdc, :filename, :mimeType, :imageData)
    `;

    const result = await conn.execute(
      sql,
      {
        bmdc: bmdc,
        filename: filename,
        mimeType: mimeType,
        imageData: { val: imageBuffer, type: oracledb.BLOB },
      },
      { autoCommit: true }
    );

    console.log("NID image inserted into database successfully");
  } catch (err) {
    console.error("Error inserting NID image into database:", err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing database connection:", err);
      }
    }
  }
}
app.get("/api/doctor-nid-image/:bmdc", async (req, res) => {
  let conn;
  try {
    conn = await connection();
    const sql = `SELECT image_data, mime_type FROM doctor_nid_images WHERE bmdc = :bmdc AND ROWNUM = 1`;
    const binds = { bmdc: req.params.bmdc };
    const result = await conn.execute(sql, binds);
    if (result.rows.length > 0) {
      const [lob, mimeType] = result.rows[0];
      console.log('Sending NID image with MIME type:', mimeType);
      
      res.setHeader('Content-Type', mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', 'inline');
  
      lob.on('end', () => console.log('Finished sending NID image data'));
      lob.pipe(res);
    } else {
      console.log('No NID image found for BMDC:', req.params.bmdc);
      res.status(404).send("NID image not found");
    }
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).send("Server error");
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("Error closing connection: ", err);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
