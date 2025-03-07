const oracledb = require("oracledb");
const dotenv = require("dotenv");

dotenv.config();

const connection = async () => {
  try {
    const conn = await oracledb.getConnection({
      user: process.env.USER,
      password: process.env.PASS,
      connectString: process.env.CONNECT_STRING,
    });

    console.log("Connected to Oracle database");
    return conn;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const run_query = async (query, params) => {
  let conn;
  try {
    conn = await connection();
    const result = await conn.execute(query, params);
    await conn.commit();
    return result.rows;
  } catch (err) {
    console.log(err);
    throw err; // Rethrow the error to propagate it
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.log("Error closing connection:", err);
      }
    }
  }
};

module.exports = {
  connection,
  run_query
};