const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const convertToCamelCase = require('../utils/convertToCamelCase'); //REMOVE
const { snakeToCamel } = require('../utils/caseConverter');
const {
  getUser,
  createUser,
  getUsersByRoomCode,
} = require('../models/usersModel');
const {} = require('../models/roomsModel');

//BUG: need to encapsulate to getUsersByRoomCode() in usersModel
exports.getPlayersInRoom = async (req, res) => {
  try {
    const roomCode = req.params.roomCode;
    const result = await pool.query(
      'SELECT * FROM users WHERE room_code = $1',
      [roomCode]
    );

    res.json({ users: snakeToCamel(result.rows) });
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

    const user = await createUser(userId, username, roomCode, true);

    // create room and assign roomCode
    await pool.query(`INSERT INTO rooms (room_code, host_id) VALUES ($1, $2)`, [
      roomCode,
      userId,
    ]);

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating room' });
  }
};

//
exports.joinRoom = async (req, res) => {
  try {
    const { username, roomCode } = req.body;
    const userId = uuidv4();
    // NOTE: Add checking of non existing and non valild room codes

    const user = await createUser(userId, username, roomCode, false);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error joining room' });
  }
};
