const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;
const client = new Pool({
  ssl: {
    rejectUnauthorized: process.env.SSL_REJECT_UNAUTHORIZED === "true",
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
