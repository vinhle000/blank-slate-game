const pool = require('../config/db');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('join_room', async ({ roomCode, userId }) => {
      socket.join(roomCode);

      // Check if user is exists in DB by userId
      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [
        userId,
      ]);

      if (userRes.rows.length > 0) {
        const player = userRes.rows[0];

        // ✅ Emit full player object, not inside `{ player: player }`
        io.to(roomCode).emit('player_joined', player);
        console.log(`🛠 Player ${player.username} joined room ${roomCode}`);
      } else {
        console.log(`⚠ User with ID ${userId} not found.`);
      }
    });

    socket.on('start_round', async (roomCode) => {
      try {
        console.log(`🟢 Starting new round for room ${roomCode}`);

        // Load prompts
        const promptsPath = path.join(__dirname, '../data/gamePrompts.json');
        const prompts = JSON.parse(fs.readFileSync(promptsPath));
        const prompt = prompts[Math.floor(Math.random() * prompts.length)];

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

        io.to(roomCode).emit('round_start', { roundNumber, prompt });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected');
    });
  });
};
