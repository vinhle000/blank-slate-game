require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./config/db'); // PostgreSQL Connection

const roomRoutes = require('./routes/roomRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Attach WebSocket instance, io to requests so controllers can access it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// WebSocket init
const gameSockets = require('./sockets/gameSockets');
gameSockets(io);

app.use(cors());
app.use(express.json());

// API Route to Create a Room
app.use('/api/rooms', roomRoutes);
app.use('/api/game', gameRoutes);

app.get('/test', async (req, res) => {
  try {
    console.log('GET /test endpoint hit');
    res.status(200).json('hello');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'GET /test endpoint error' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
