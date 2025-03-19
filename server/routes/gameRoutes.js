const express = require('express');
const {
  startRound,
  submitAnswer,
  calculateScore,
} = require('../controllers/gameController');

const router = express.Router();

// router.post('/start-round/:roomCode', startRound);
router.post('/submit-answer', submitAnswer);
router.post('/calculate-score', calculateScore);

module.exports = router;
