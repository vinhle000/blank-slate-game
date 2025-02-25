import { useState } from 'react';
import axios from 'axios';
import { socket } from './socket';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const createRoom = async () => {
    console.log('creating rooom');
    const res = await axios.post('http://localhost:5001/create-room', {
      username,
    });
    console.log('res data-----> ', res.data);
    setRoomCode(res.data.roomCode);
    setGameStarted(true);
    socket.emit('join_room', { roomCode: res.data.roomCode, username });
  };

  const joinRoom = () => {
    socket.emit('join_room', { roomCode, username });
    setGameStarted(true);
  };

  return (
    <div>
      <h1>Blank Slate</h1>
      {!gameStarted ? (
        <div>
          <input
            type='text'
            placeholder='Your Name'
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={createRoom}>Create Room</button>
          <input
            type='text'
            placeholder='Room Code'
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <h2>Room Code: {roomCode}</h2>
      )}
    </div>
  );
}

export default App;
