const { Pool } = require("pg");
require("dotenv").config();

const client = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  port: process.env.PGPORT,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false, // Set to true in production for better security
  },
});

async function connectToDb() {
  try {
    await client.connect();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Connection error", err.stack);
  }
}

module.exports = {
  client,
  connectToDb,
};
