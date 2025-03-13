const express = require('express');
const { startRound, submitAnswer } = require('../controllers/gameController');

const router = express.Router();

// router.post('/start-round/:roomCode', startRound);
router.post('/submit-answer', submitAnswer);

module.exports = router;
