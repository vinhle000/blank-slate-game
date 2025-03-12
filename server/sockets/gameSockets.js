const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { snakeToCamel } = require('../utils/caseConverter');
const { updateRoom } = require('../models/roomsModels.js');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('join_room', async ({ roomCode, userId }) => {
      socket.join(roomCode);

      //TODO: Encapsulate this in usersModel.js,  Create and persist new round
      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [
        userId,
      ]);

      if (userRes.rows.length > 0) {
        const player = snakeToCamel(userRes.rows[0]);

        io.to(roomCode).emit('player_joined', player);
        console.log(`🛠 Player ${player.username} joined room ${roomCode}`);
      } else {
        console.log(`⚠ User with ID ${userId} not found.`);
      }
    });

    socket.on('game_start', async (roomCode) => {
      try {
        let status = 'in_progress';
        let gamePhase = 'prompt_select_phase';
        const updatedRoom = await updateRoom(roomCode, {
          status,
          gamePhase,
        });

        let prompt = getPrompt();

        //TODO: Encapsulate this in roundsModel.js,  Create and persist new round
        await pool.query(
          'INSERT INTO rounds (room_id, round_number, prompt) VALUES ((SELECT id FROM rooms WHERE room_code = $1), 1, $2)',
          [roomCode, prompt]
        );

        console.log({ prompt, roomCode });
        io.to(roomCode).emit('prompt_select_phase_started', { prompt });
      } catch (error) {
        console.error(`Socket 'game_start' error: `, error);
      }
    });

    // Next Round
    socket.on('next_round', async (roomCode) => {
      try {
        console.log(`🟢 Starting new round for room ${roomCode}`);

        // Load prompts
        let prompt = getPrompt();

        //get round number
        const roundRes = await pool.query(
          'SELECT COUNT(*) FROM rounds WHERE room_id = (SELECT id FROM rooms WHERE room_code = $1)',
          [roomCode]
        );

        let roundNumber = parseInt(roundRes.rows[0].count) + 1;

        // Persist new round to DB
        await pool.query(
          'INSERT INTO rounds (room_id, round_number, prompt) VALUES ((SELECT id FROM rooms WHERE room_code = $1), $2, $3)',
          [roomCode, roundNumber, prompt]
        );

        io.to(roomCode).emit('prompt_select_phase_started', {
          roundNumber,
          prompt,
        });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected');
    });
  });
};

// Helper functions
const getPrompt = function () {
  // Load prompts from JSON file;
  const promptsPath = path.join(__dirname, '../data/gamePrompts.json');
  const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));

  if (!prompts || prompts.length === 0) {
    throw new Error('Prompt list is empty!');
  }

  // Pick a random prompt
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  return prompt.cue; // only need word|cue at this time
};
