const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { snakeToCamel } = require('../utils/caseConverter');
const {
  getUser,
  createUser,
  updateScoresInDatabase,
} = require('../models/usersModel');
const { updateRoom } = require('../models/roomsModel');
const { createAnswer, getAnswersByIds } = require('../models/answerModel');
const { getRound } = require('../models/roundsModel');

const {
  createRound,
  getLatestRoundNumber,
  getRoundsInRoom,
  updateRound,
  appendAnswerToRound,
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
        console.error('Error getting new prompt: ', error);
      }
    });

    socket.on('confirm_prompt', async ({ prompt, roundId, roomCode }) => {
      try {
        const updatedRoom = await updateRoom(roomCode, {
          gamePhase: 'answer_phase',
        });
        const round = await updateRound(roundId, { prompt: prompt });

        io.to(roomCode).emit('prompt_confirmed', { round: round });
      } catch (error) {
        console.error(error);
      }
    });

    // TODO: Add Timer ending to trigger same socket broadcast to players
    socket.on('end_round', async ({ roomCode }) => {
      try {
        const room = await updateRoom(roomCode, {
          gamePhase: 'display_answer_phase',
        });
        io.to(roomCode).emit('round_ended');
      } catch (error) {
        console.error('Error attempting to end round: ', error);
      }
    });

    socket.on(
      'submit_answer',
      async ({ roomCode, roundId, userId, answer }) => {
        try {
          // check round
          const round = await getRound(roundId);
          if (!round) {
            throw Error('round id not found');
          }

          const user = await getUser(userId);
          if (!user) {
            throw Error('user id not found');
          }
          // Create and persist answer and append to current round
          let answerData = await createAnswer(roundId, userId, answer);
          let updatedRound = await appendAnswerToRound(roundId, answerData.id);

          const playersInRoom = await getPlayersInRoom(roomCode);
          console.log(
            '----------- gameSocket / submit_answer info --------------------- ',
            {
              answerData,
              updatedRound,
              playersInRoom,
            }
          );

          // TODO: Maybe send down answerIds, then back 'answerIds' with calculate_scores event
          // So do not have to perform a get round DB look up.
          if (updatedRound.answerIds.length === playersInRoom.length) {
            console.log('✅ All answers submitted. Notifying host...');
            io.to(roomCode).emit('all_answers_submitted');
          }
        } catch (error) {
          console.error('Error submitting answer for user: ', error);
        }
      }
    );

    socket.on('calculate_scores', async ({ roomCode, roundId }) => {
      try {
        const updatedUsers = await calculateScores(roundId);
        io.to(roomCode).emit('scores_updated', { users: updatedUsers });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on('show_results', async ({ roomCode }) => {
      try {
        const room = await updateRoom(roomCode, { gamePhase: 'results_phase' });
        console.log('On show_result  -  room = ', room);
        io.to(roomCode).emit('showing_results');
      } catch (error) {
        console.error('Error with show_result broadcast: ', error);
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

//Helper functions--------
//Almost Identical to getPlayersInRoom function for API endpoint
const getPlayersInRoom = async (roomCode) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE room_code = $1',
      [roomCode]
    );
    return snakeToCamel(result.rows);
  } catch (error) {
    console.error('Error getting players(users) in room: ', error);
    throw Error(error);
  }
};

//Almost Identical to calculateScore function for API endpoint
const calculateScores = async function (roundId) {
  try {
    const round = await getRound(roundId);
    // if (!round) {
    //   throw new Error('Round id not found');
    // }

    // if (!round.answerIds || round.answerIds.length === 0) {
    //   throw new Error('No answers submitted/found for this round');
    // }

    // Getting answers occurrences, and assign scores of this round to each userId
    const answers = await getAnswersByIds(round.answerIds);
    const answerCounts = {}; // { answerText: count }
    const scoreMap = {}; // { userId: score }

    for (const { answer } of answers) {
      answerCounts[answer] = (answerCounts[answer] || 0) + 1;
    }

    for (const { userId, answer } of answers) {
      let count = answerCounts[answer];
      let score = 0;

      // Blank Slate rules
      // - One pair match scores 3
      // - Two or more match scores 1
      // - No match, score 0
      if (count === 2) {
        score = 3;
      } else if (count >= 3) {
        score = 1;
      }
      scoreMap[userId] = score;
    }

    const users = await updateScoresInDatabase(scoreMap);

    return users;
  } catch (error) {
    console.error('Error calculating score for round:  ', error);
  }
};
