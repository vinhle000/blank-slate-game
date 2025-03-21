const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { snakeToCamel } = require('../utils/caseConverter');
const {
  getUser,
  createUser,
  updateScoresInDatabase,
  resetUserScores,
  removeUser,
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
      const updatedPlayers = await getPlayersInRoom(roomCode);

      if (!!user && user?.roomCode) {
        io.to(roomCode).emit('player_list_updated', {
          players: updatedPlayers,
        });
        console.log(`🛠 Player ${user.username} joined room ${roomCode}`);
      }
    });

    socket.on('player_left', async ({ roomCode, userId }) => {
      try {
        console.log(`🚪 Player ${userId} left room ${roomCode}`);
        //TODO //FIX: Handle edge case where Host exits the room
        // - Still Players in room, Reassign host to one of players in room
        // - No Players left and Host leaves, delete room
        let removedUser = await removeUser(userId); //
        const updatedPlayers = await getPlayersInRoom(roomCode);

        if (!!removedUser) {
          io.to(roomCode).emit('player_list_updated', {
            players: updatedPlayers,
          });
        }
      } catch (error) {
        console.error('Error handling player exit: ', error);
      }
    });

    socket.on('game_start', async ({ roomCode, players }) => {
      try {
        // reset user scores
        await resetUserScores(players);
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
        console.log('TEST - on game_start > sent prompt_select_phase_started');
      } catch (error) {
        console.error(`Socket 'game_start' error: `, error);
      }
    });

    socket.on('next_round', async (roomCode) => {
      try {
        console.log(`🟢 Starting NEW round for room ${roomCode}`);

        let prompt = getPrompt();
        let latestRoundNumber = await getLatestRoundNumber(roomCode);

        const currentRound = await createRound(
          roomCode,
          latestRoundNumber + 1,
          prompt
        );
        io.to(roomCode).emit('prompt_select_phase_started', {
          currentRound,
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

          const cleanedAnswer = answer.trim().toLowerCase(); // For consistent storing, scoring, and displaying

          // Create and persist answer and append to current round
          let answerData = await createAnswer(roundId, userId, cleanedAnswer);
          let updatedRound = await appendAnswerToRound(roundId, answerData.id);

          const playersInRoom = await getPlayersInRoom(roomCode);

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

        const winningUsers = await checkForWinners(updatedUsers);
        if (winningUsers.length > 0) {
          io.to(roomCode).emit('win_found', { winningUsers });
          console.log(`🏆 Game over! Winners: `, winningUsers);
          return; // Stop game progression if we have winners
        }
        // Want players to be able to display and share answers before we go to results page
        // console.log("🔄 No winners yet. Moving to next round...");
        // io.to(roomCode).emit('show_results');
      } catch (error) {
        console.error(error);
      }
    });

    // NOTE: socket.on 'show_results' Need to reset room status back to 'waiting' upon Restarting game
    // On show_result  -  room =  {
    //   id: 'f5e32bbe-fc3d-48bd-b6cc-3a15aa4ae679',
    //   roomCode: 'CY79L',
    //   hostId: '9afb1b70-2cbd-48b6-9d1d-935621abec47',
    //   status: 'in_progress',    <---------- HANDLE room status, or remove if not necessary
    //   gamePhase: 'game_complete' <------------ Only updating gamePhase
    socket.on('show_results', async ({ roomCode, winningUsers }) => {
      try {
        // const status = winningUsers ? 'complete' : 'in_progress'; // roomStatus Currently NOT serving much functionality
        const gamePhase = winningUsers ? 'game_complete' : 'results_phase';
        const room = await updateRoom(roomCode, { gamePhase });
        console.log('On show_result  -  room = ', room);
        io.to(roomCode).emit('showing_results', { gamePhase });
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

/**
 * Filters out for users that has total score >= PointsRequiredToWin
 * @param {[object]} - array users
 * @returns {array} - user objects
 * {userId: {username,roomCode, totalScore}} for quick lookup
 */
const checkForWinners = async function (users, roomCode) {
  //TODO: Set to 25, or make it configurable, make new column in Users table.
  let winningUsers = users.filter((user) => user.totalScore >= 5);
  return winningUsers;
  return winningUsers;
};
