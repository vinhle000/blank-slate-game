module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('join_room', ({ roomCode, username }) => {
      socket.join(roomCode);
      io.to(roomCode).emit('player_joined', { username });
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected');
    });
  });
};
