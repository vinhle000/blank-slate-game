const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

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

exports.createRoom = async (req, res) => {
  try {
    const { username } = req.body;
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const userId = uuidv4();

    // create user as host
    const userRes = await pool.query(
      `INSERT INTO users (id, username, room_code, is_host) VALUES ($1, $2, $3, $4)`,
      [userId, username, roomCode, true]
    );

    // create room and assign roomCode
    await pool.query(`INSERT INTO rooms (room_code, host_id) VALUES ($1, $2)`, [
      roomCode,
      userId,
    ]);

    res.json({ roomCode, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error create room' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { username, roomCode } = req.body;
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users (id, username, room_code, is_host) VALUES ($1, $2, $3, $4)`,
      [userId, username, roomCode, false]
    );

    res.json({ userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error joining room' });
  }
};
