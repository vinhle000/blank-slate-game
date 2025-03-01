const express = require('express');
const {
  createRoom,
  joinRoom,
  getPlayersInRoom,
} = require('../controllers/roomController');

const router = express.Router();

router.get('/:roomCode/players', getPlayersInRoom);
router.post('/create-room', createRoom);
router.post('/join-room', joinRoom);

module.exports = router;
