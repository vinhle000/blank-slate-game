const pool = require('../config/db');
const { snakeToCamel } = require('../utils/caseConverter');
/*
answers
    id UUID
    round_id
    user_id
    answer TEXT
    score INT DEFAULT 0
*/
async function createAnswer(roundId, userId, answerText) {
  try {
    const result = await pool.query(
      `
      INSERT INTO answers
      (round_id, user_id, answer)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [roundId, userId, answerText]
    );

    return snakeToCamel(result.rows[0]);
  } catch (error) {
    console.error('Error creating answer in DB: ', error);
    throw error;
  }
}

module.exports = {
  createAnswer,
};
