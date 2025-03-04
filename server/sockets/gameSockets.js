module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('join_room', ({ roomCode, username }) => {
      socket.join(roomCode);
      io.to(roomCode).emit('player_joined', { username });
      console.log(`🛠 Player ${username} joined room ${roomCode}`);
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
