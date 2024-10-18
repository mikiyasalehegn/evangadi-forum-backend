const express = require("express");
const router = express.Router();
const {
  AllQuestions,
  askQuestion,
  SingleQuestion,
  editQuestion,
  deleteQuestion,
} = require("../controller/questionController");
const authMiddleware = require("../middleware/authMiddlware");

// **Get all questions Route**
router.get("/", AllQuestions);
router.get("/:question_id", SingleQuestion);

// edit question
router.patch("/:questionId", editQuestion);

// **Post a Question Route**
router.post("/", authMiddleware, askQuestion);

// ** Delete a Question Route**
router.delete("/:questionId", deleteQuestion);

module.exports = router;
