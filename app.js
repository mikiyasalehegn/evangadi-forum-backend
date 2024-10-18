const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const authMiddleware = require("./middleware/authMiddlware.js");
const cors = require("cors");
app.use(cors());
app.use(express.json());

//  db connection
const db = require("./db/dbConfig.js");

// user routes middleware file
const userRoutes = require("./routes/userRoutes.js");
app.use("/api/users", userRoutes);

// questions routes middleware
const questionsRoutes = require("./routes/questionRoutes.js");
app.use("/api/questions", authMiddleware, questionsRoutes);

//answer route
const answerRoutes = require("./routes/answerRoutes.js");
app.use("/api/answer", authMiddleware, answerRoutes);

const port = process.env.PORT || 3000;

// Start the server and query the database
async function start() {
  try {
    // Connect to the database
    await db.connectToDb();

    // Start listening on the specified port
    app.listen(port, () => {
      console.log(`Server is running and listening on port ${port}`);
    });

    // Here, you would typically start your server (if using Express or other frameworks)
  } catch (err) {
    console.error("Error:", err);
  }
}

// Start the app
start();
