const express = require('express');
const { startRound } = require('../controllers/gameController');

const router = express.Router();

router.post('/start-round/:roomCode', startRound);

module.exports = router;
