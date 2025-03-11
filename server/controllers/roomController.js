const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const convertToCamelCase = require('../utils/convertToCamelCase');

exports.getPlayersInRoom = async (req, res) => {
  try {
    const roomCode = req.params.roomCode;
    const result = await pool.query(
      'SELECT * FROM users WHERE room_code = $1',
      [roomCode]
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting players in room' });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const roomCode = req.params.roomCode;
    const result = await pool.query(
      'SELECT * FROM rooms WHERE room_code = $1',
      [roomCode]
    );

    res.json({ room: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting getting room info' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { username } = req.body;
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const userId = uuidv4();

    // create user as host
    const userRes = await pool.query(
      `INSERT INTO users (id, username, room_code, is_host, total_score) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, username, roomCode, true, 0]
    );

    // create room and assign roomCode
    await pool.query(`INSERT INTO rooms (room_code, host_id) VALUES ($1, $2)`, [
      roomCode,
      userId,
    ]);

    res.json(convertToCamelCase(userRes.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error create room' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { username, roomCode } = req.body;
    const userId = uuidv4();
    // NOTE: Add checking of non existing and non valild room codes
    const userRes = await pool.query(
      `INSERT INTO users (id, username, room_code, is_host, total_score) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, username, roomCode, false, 0]
    );
    console.log(' JOIN user Response from query ---> ', userRes.rows[0]);
    res.json(convertToCamelCase(userRes.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error joining room' });
  }
};
