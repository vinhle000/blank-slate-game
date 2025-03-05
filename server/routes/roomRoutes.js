const express = require('express');
const {
  createRoom,
  joinRoom,
  getPlayersInRoom,
  getRoom,
} = require('../controllers/roomController');

const router = express.Router();

router.get('/:roomCode/players', getPlayersInRoom);
router.get('/:roomCode', getRoom);
router.post('/create-room', createRoom);
router.post('/join-room', joinRoom);

module.exports = router;
