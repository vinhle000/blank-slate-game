require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// PostgreSQL Connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log(' This is my current connction ', pool);

app.use(cors());
app.use(express.json());

// API Route to Create a Room
app.post('/create-room', async (req, res) => {
  try {
    console.log(' User tyring to create room ,', req.body);
    const { username } = req.body;
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    //create user and room
    const userRes = await pool.query(
      'INSERT INTO users (username, room_code) VALUES ($1, $2) RETURNING id',
      [username, roomCode]
    );

    const userId = userRes.rows[0].id;

    await pool.query('INSERT INTO rooms (room_code, host_id) VALUES ($1, $2)', [
      roomCode,
      userId,
    ]);

    res.json({ roomCode, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating room' });
  }
});

// app.get('/test', async (req, res) => {
//   try {
//     console.log('GET /test endpoint hit');
//     res.status(200).json('hello');
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'GET /test endpoint error' });
//   }
// });

// WebSocket Connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', async ({ roomCode, username }) => {
    socket.join(roomCode);
    await pool.query(
      'INSERT INTO users (username, room_code) VALUES ($1, $2)',
      [username, roomCode]
    );

    io.to(roomCode).emit('player_join', { username });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5001;
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
