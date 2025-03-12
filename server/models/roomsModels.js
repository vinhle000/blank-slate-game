const pool = require('../config/db');
const { camelToSnake, snakeToCamel } = require('../utils/caseConverter');

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

    return result.rows[0];
  } catch (error) {
    console.error('Error updating room status: ', error);
    throw error;
  }
}

module.exports = {
  updateRoom,
};
