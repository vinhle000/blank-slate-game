const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

// TODO: Add prompt selection redo/draw different one
// Take into account for redo as the game goes, we have "discard pile" so no same prompts during games

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
