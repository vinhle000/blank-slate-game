const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { snakeToCamel } = require('../utils/caseConverter');
const { getUser, createUser } = require('../models/usersModel');
const { updateRoom } = require('../models/roomsModel');
const {
  createRound,
  getLatestRoundNumber,
  getRoundsInRoom,
  updateRound,
} = require('../models/roundsModel');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('join_room', async ({ roomCode, userId }) => {
      socket.join(roomCode);
      const user = await getUser(userId);

      if (!!user && user?.roomCode) {
        io.to(roomCode).emit('player_joined', user);
        console.log(`🛠 Player ${user.username} joined room ${roomCode}`);
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
        const currentRound = await createRound(roomCode, 1, prompt);

        io.to(roomCode).emit('prompt_select_phase_started', {
          prompt,
          currentRound,
        });
      } catch (error) {
        console.error(`Socket 'game_start' error: `, error);
      }
    });

    socket.on('next_round', async (roomCode) => {
      try {
        console.log(`🟢 Starting new round for room ${roomCode}`);

        let prompt = getPrompt();
        let latestRoundNumber = await getLatestRoundNumber(roomCode);

        await createRound(roomCode, latestRoundNumber + 1, prompt);
        io.to(roomCode).emit('prompt_select_phase_started', {
          latestRoundNumber,
          prompt,
        });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on('change_prompt', async () => {
      try {
        const prompt = getPrompt();
        socket.emit('prompt_changed', { prompt });
      } catch (error) {
        console.log('Error getting new prompt');
      }
    });

    // TODO: test this socket and verify it persists to db
    socket.on('confirm_prompt', async ({ prompt, roundId, roomCode }) => {
      try {
        const round = await updateRound(roundId, { prompt: prompt });
        io.to(roomCode).emit('prompt_confirmed', { round: round });
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
