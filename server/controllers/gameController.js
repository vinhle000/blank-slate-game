const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { getUser } = require('../models/usersModel');
const { getRound, appendAnswerToRound } = require('../models/roundsModel');
const { createAnswer } = require('../models/answerModel.js');

// TODO: Add prompt selection redo/draw different one
// Take into account for redo as the game goes, we have "discard pile" so no same prompts during games
// Current NOT in use - starting round procedure is done in gameSocket.js
exports.startRound = async (req, res) => {
  try {
    const roomCode = req.params.roomCode;

    // Get current round number
    const roundRes = await pool.query(
      'SELECT COUNT(*) FROM rounds WHERE room_id = (SELECT id FROM rooms WHERE room_code = $1)',
      [roomCode]
    );

    // If no round exists, create one
    let newPrompt = getPrompt();

    const roundNumber = parseInt(roundRes.rows[0].count) + 1;

    // Save new round to database
    await pool.query(
      'INSERT INTO rounds (room_id, round_number, prompt) VALUES((SELECT id FROM rooms WHERE room_code = $1), $2, $3)',
      [roomCode, roundNumber, prompt]
    );

    res.json({ roundNumber, prompt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error starting round' });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { roundId, userId, answer } = req.body;
    const round = await getRound(roundId);
    if (!round) {
      return res.status(404).json({ error: 'round not found' });
    }

    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    let answerData = await createAnswer(roundId, userId, answer); // using what Id from the DB resource
    let roundAnswerIds = await appendAnswerToRound(roundId, answerData.id);

    res.status(201).json({ answer: answerData, answerIds: roundAnswerIds });
  } catch (error) {
    console.error('Error submitting answer: ', error);
    res.status(500).json({ error: 'Error submitting answer' });
  }
};

// Helper functions
const getPrompt = () => {
  // Load prompts from JSON file;
  const promptsPath = path.join(__dirname, '../data/gamePrompts.json');
  const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));

  if (!prompts || prompts.length === 0) {
    throw new Error('Prompt list is empty!');
  }

  // Pick a random prompt
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  return prompt;
};
