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

/**
 * Get answer(s) in DB by UUIDs
 * @param {[string]} userIds - array of answer UUIDs
 * @returns {Promise<object>} - array of answer ({id, userId, answer}) data objects
 */
async function getAnswersByIds(answerIds) {
  try {
    const result = await pool.query(
      `
      SELECT id, user_id, answer
      FROM answers
      WHERE id = ANY($1)
      `,
      [answerIds]
    );

    // console.log('Raw result.rows:', result.rows); // Should be an array
    const transformed = snakeToCamel(result.rows);
    // console.log('Transformed result:', transformed); // Should still be an array

    return transformed;
  } catch (error) {
    console.error('Error retrieving answers from DB:', error);
    throw error;
  }
}

/**
 * Create new answer in DB
 * @param {string} roundId - UUID of round
 * @param {string} userId - UUID of user
 * @param {string} answer - text of the user the answer to respond to the round prompt
 * @returns {Promise<object>} - answer data obj
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
  getAnswersByIds,
  createAnswer,
};
