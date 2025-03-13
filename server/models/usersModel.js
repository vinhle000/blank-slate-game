const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { camelToSnake, snakeToCamel } = require('../utils/caseConverter');

/**
 * Gets user by UUID
 * @param {string} userID - The unique room code to identify the room.
 * @returns {Promise<object>} -  users
 */
async function getUser(userId) {
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [
      userId,
    ]);
    if (userRes.rows.length > 0) {
      return snakeToCamel(userRes.rows[0]);
    } else {
      console.log(`⚠ User with ID ${userId} not found.`);
      return null;
    }
  } catch (error) {
    console.log('Error getting user: ', error);
    throw error;
  }
}

/**
 * Creates a user (host or other player)
 * @param {string}  username - Username (display name)
 * @param {string} roomCode - Unique room code
 * @param {boolean} isHost - User that createsRoom is a Host
 * @returns {Promise<object>} - User object(camelCase) of newly created user
 */
async function createUser(userId, username, roomCode, isHost) {
  try {
    const query = `
    INSERT INTO users (id, username, room_code, is_host, total_score)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      username,
      roomCode,
      isHost,
      0,
    ]);
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    console.error('Error creating user: ', error);
    throw error;
  }
}

//TODO: fix function to query for supplying roomController.js -> getPlayersInRoom()
/**
 * Gets list Users(Players) in room by roomCode
 * @param {string} roomCode - The unique room code to identify the room.
 * @returns {Promise<object>} - array of users
 */
// async function getUsersByRoomCode(roomCode) {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM users WHERE room_code = $1',
//       [roomCode]
//     );

//     if (result.rows.length > 0) {
//       return snakeToCamel(result.rows[0]);
//     } else {
//       console.log('No users found by roomCode');
//       return [];
//     }
//   } catch (error) {
//     console.log('Error getting users by roomCode ', error);
//     throw error;
//   }
// }

module.exports = {
  getUser,
  createUser,
  // getUsersByRoomCode,
};
