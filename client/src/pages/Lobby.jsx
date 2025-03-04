import { useEffect, useState } from 'react';
import socket from '../socket';
import axios from 'axios';

export default function Lobby() {
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [username, setUsername] = useState('');

  const createRoom = async () => {
    const response = await axios.post(
      'http://localhost:3000/api/rooms/create-room',
      { username }
    );

    setRoomCode(response.data.roomCode);
    socket.emit('join_room', { roomCode: response.data.roomCode, username });
  };

  const joinRoom = async () => {
    await axios.post('http://localhost:3000/api/rooms/join-room', {
      roomCode,
      username,
    });
    socket.emit('join_room', { roomCode, username });
    fetchPlayers(); // Fetch latest player list after joining
  };

  const fetchPlayers = async () => {
    if (!roomCode) return;

    try {
      const response = await axios.get(
        `http://localhost:3000/api/rooms/${roomCode}/players`
      );

      setPlayers(response.data.users);
    } catch (error) {
      console.error('Error fetching players: ', error);
    }
  };

  useEffect(() => {
    fetchPlayers(); //fetch upon component mounts

    socket.on('player_joined', ({ username }) => {
      setPlayers((prev) => [...prev, username]);
    });

    return () => socket.off('player_joined');
  }, [fetchPlayers, roomCode]); // Depend on `roomCode` so it fetches correctly when a room is set

  return (
    <div>
      <h2>Blank Slate</h2>
      <div>
        <input
          type='text'
          placeholder='Player Name'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <input
          type='text'
          placeholder='Room Code'
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <div>
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>

      <div>
        <button onClick={createRoom}>Create Room </button>
      </div>

      <h2>Room Code: {roomCode}</h2>
      <h3>Players:</h3>
      {players.map((player) => (
        <li key={player.id}>{player.username}</li>
      ))}
    </div>
  );
}
