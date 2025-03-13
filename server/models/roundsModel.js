const pool = require('../config/db');
const { camelToSnake, snakeToCamel } = require('../utils/caseConverter');

/**
 * Creates a new round
 * @param {string} roomCode - Unique room code
 * @param {number} roundNumber - number of round in game for respective room
 * @param {string} prompt - prompt to display for players
 * @returns {Promise<object>} - round data obj
 */
async function createRound(roomCode, roundNumber, prompt) {
  try {
    const result = await pool.query(
      'INSERT INTO rounds (room_id, round_number, prompt) VALUES ((SELECT id FROM rooms WHERE room_code = $1), $2, $3) RETURNING *',
      [roomCode, roundNumber, prompt]
    );
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    console.error('Error creating new round: ', error);
    throw error;
  }
}

/**
 * Get latest round number for room
 * @param {string} roomCode - Unique room code
 * @returns {Promise<number>} - array of rounds
 */
async function getLatestRoundNumber(roomCode) {
  try {
    const result = await pool.query(
      `
      SELECT COUNT(*) AS count
      FROM rounds
      WHERE room_id = (SELECT id FROM rooms WHERE room_code = $1)`,
      [roomCode]
    );

    return Number(result.rows[0].count);
  } catch (error) {
    console.error(`Error getting rounds for room: ${roomCode}: ${error}`);
    throw error;
  }
}

/**
 * Get rounds by roomCode
 * @param {string} roomCode - Unique room code
 * @returns {Promise<object>} - array of rounds
 */
async function getRoundsInRoom(roomCode) {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM rounds
      WHERE room_id = (SELECT id FROM rooms WHERE room_code = $1)`,
      [roomCode]
    );

    return result.rows.map(snakeToCamel);
  } catch (error) {
    console.error(`Error getting rounds for room: ${roomCode}: ${error}`);
    throw error;
  }
}
/**
 * Update round's fields dynamically
 * @param {string} roundId - UUID of round
 * @param {object} updates - Obj containing fields to update
 * @returns {Promise<object>} - updated room ojb
 */
async function updateRound(roundId, updates) {
  try {
    const queryUpdates = camelToSnake(updates);

    // Since roundId would be $1, adding 2 to index for proceeding values
    const setClause = Object.keys(queryUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const result = await pool.query(
      `
      UPDATE rounds
      SET ${setClause}
      WHERE id = $1
      RETURNING *`,
      [roundId, ...Object.values(updates)]
    );

    return snakeToCamel(result.rows[0]);
  } catch (error) {
    console.error('Error updating round:', error);
    throw error;
  }
}
module.exports = {
  createRound,
  getLatestRoundNumber,
  getRoundsInRoom,
  updateRound,
};
