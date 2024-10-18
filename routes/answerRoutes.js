const express = require("express");
const router = express.Router();

const {
  postAnswer,
  editAnswer,
  deleteAnswer,
  getanswer,
} = require("../controller/answerController");

// routes
router.post("/", postAnswer);
router.patch("/:answerId", editAnswer);
router.delete("/:answerId", deleteAnswer);
router.get("/:question_id", getanswer);

module.exports = router;
