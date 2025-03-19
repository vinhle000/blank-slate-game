const pool = require('../config/db');
const { camelToSnake, snakeToCamel } = require('../utils/caseConverter');

/**
 * Gets a room by roomCode
 * @param {string} roomCode - The unique room code to identify the room.
 * @returns {Promise<object>} - room obj data
 */
async function getRoom(roomCode) {
  // const result = await pool.query(
  //   'SELECT * FROM rooms WHERE room_code = $1',
  //   [roomCode]
  // );
}

/**
 * Creates a room
 * @param {string} roomCode -  unique room code to identify the room.
 * @param {object} userId - UUID of user
 * @returns {Promise<object>} - Created room obj data.
 */
async function createRoom(roomCode, userId) {
  try {
    const query = `
    INSERT INTO rooms (room_code, host_id)
     VALUES ($1, $2)
     RETURNING *`;

    const result = await pool.query(query, [roomCode, userId]);
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    console.error('Error creating room: ', error);
    throw error;
  }
}

/**
 * Updates a room's fields dynamically.
 * @param {string} roomCode - The unique room code to identify the room.
 * @param {object} updates - An object containing the fields to update
 * (e.g., { status: 'in_progress', game_phase: 'prompt_select_phase' }).
 * @returns {Promise<object>} - The updated room data.
 */
async function updateRoom(roomCode, updates) {
  try {
    const queryUpdates = camelToSnake(updates);
    const fields = Object.keys(queryUpdates);
    const values = Object.values(queryUpdates);

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    console.debug('setClouse string ', setClause);

    const query = `UPDATE rooms
       SET ${setClause}
       WHERE room_code = $1
       RETURNING *`;

    const result = await pool.query(query, [roomCode, ...values]);

    return snakeToCamel(result.rows[0]);
  } catch (error) {
    console.error('Error updating room status: ', error);
    throw error;
  }
}

module.exports = {
  createRoom,
  updateRoom,
};
