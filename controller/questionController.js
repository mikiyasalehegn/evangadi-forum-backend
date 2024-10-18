const db = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

// ** POST QUESTION Handler
async function askQuestion(req, res) {
  const { title, content } = req.body;
  const user_id = req.user.userId;
  console.log(req.user);

  if (!title || !content) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Bad Request",
      message: "Please provide all required fields",
    });
  }

  try {
    await db.client.query(
      "INSERT INTO questions (user_id, title, content) VALUES ($1, $2, $3)",
      [user_id, title, content]
    );

    return res.status(StatusCodes.CREATED).json({
      message: "Question created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
    });
  }
}

//** All question handler**
const AllQuestions = async (req, res) => {
  const questionQuery =
    "SELECT questions.*, users.username, users.email FROM questions JOIN users ON questions.user_id = users.userid ORDER BY questions.question_id DESC";
  try {
    // Query the database for all questions
    const response = await db.client.query(questionQuery);

    // Check if there are no questions found
    if (response.rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "No questions found.",
      });
    }

    // Send all the questions in the response
    res.status(200).json(response.rows); // Send the entire array of rows
  } catch (error) {
    // Log any errors and send an error response
    console.log(error);
    res.status(500).send({
      error: "Server Error",
      message: error.message,
    });
  }
};

const SingleQuestion = async (req, res) => {
  const { question_id } = req.params;
  const selectSingleQuestion = "SELECT * FROM questions WHERE question_id = $1";
  try {
    const { rows } = await db.client.query(selectSingleQuestion, [question_id]);
    res.status(StatusCodes.OK).json(rows[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "An unexpected error occurred.",
    });
  }
};

const editQuestion = async (req, res) => {
  const userId = req.user.userId; // Assuming the user's ID is stored in req.user
  const { questionId } = req.params;
  const { title, content } = req.body;

  // Validation: Check if at least title or content is provided
  if (!title && !content) {
    return res
      .status(400)
      .json({ error: "At least title or description is required" });
  }

  // Query to fetch the user_id of the question owner
  const getQuestionQuery = `SELECT user_id FROM questions WHERE question_id = $1`;

  try {
    const { rows: questionResult } = await db.client.query(getQuestionQuery, [
      questionId,
    ]);

    if (questionResult.length === 0) {
      return res
        .status(404)
        .json({ error: `No question found with id ${questionId}` });
    }

    // Check if the current user owns the question
    const questionOwnerId = questionResult[0].user_id;
    if (questionOwnerId !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this question" });
    }

    // Prepare the fields and values for the update query dynamically
    let fields = [];
    let values = [questionId]; // Always include questionId as the first value for the WHERE clause

    if (title) {
      fields.push(`title = $${fields.length + 2}`);
      values.push(title);
    }

    if (content) {
      fields.push(`content = $${fields.length + 2}`);
      values.push(content);
    }

    // If no fields are being updated, return early
    if (fields.length === 0) {
      return res.status(400).json({
        error: "At least one field (title or content) must be updated",
      });
    }

    // Update query
    const updateQuery = `
      UPDATE questions 
      SET ${fields.join(", ")} 
      WHERE question_id = $1 
      RETURNING *`; // PostgreSQL returns the updated rows

    const { rows: updatedRows, rowCount } = await db.client.query(
      updateQuery,
      values
    );

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: `No question found with id ${questionId}` });
    }

    // Success
    return res.status(200).json({
      message: "Question updated successfully",
      updatedQuestion: updatedRows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  const userId = req.user.userId; // Assuming you have middleware that populates req.user with the logged-in user's data
  const checkQuestion = "SELECT * FROM questions WHERE question_id = $1";

  try {
    // Check if the question exists
    const existingQuestion = await db.client.query(checkQuestion, [questionId]);
    if (existingQuestion.rows.length === 0) {
      return res
        .status(404)
        .json({ message: `No question found with id: '${questionId}'` });
    }

    const userIdDB = existingQuestion.rows[0].user_id;

    // Check if the logged-in user is authorized to delete this question
    if (userIdDB !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this question." });
    }

    // Delete all answers associated with the question first
    await db.client.query(`DELETE FROM answers WHERE question_id = $1`, [
      questionId,
    ]);

    // After answers are deleted, delete the question
    await db.client.query(`DELETE FROM questions WHERE question_id = $1`, [
      questionId,
    ]);

    // Return success message
    return res.status(200).json({
      message: "Question and associated answers deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  AllQuestions,
  SingleQuestion,
  askQuestion,
  editQuestion,
  deleteQuestion,
};
