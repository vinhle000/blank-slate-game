import { useEffect, useState, useCallback } from 'react';
import socket from '../socket';
import { createRoom, joinRoom, fetchPlayers } from '../services/roomService';

export default function Lobby() {
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [username, setUsername] = useState('');

  const handleCreateRoom = async () => {
    const data = await createRoom(username);
    setRoomCode(data.roomCode);
    socket.emit('join_room', { roomCode: data.roomCode, username });
  };

  const handleJoinRoom = async () => {
    const data = await joinRoom(username, roomCode);
    socket.emit('join_room', { roomCode, userId: data.userId });

    const playersData = await fetchPlayers(roomCode);
    setPlayers(playersData);
  };

  const fetchAndSetPlayers = useCallback(async () => {
    const playersData = await fetchPlayers(roomCode);
    setPlayers(playersData);
  }, [roomCode]);

  useEffect(() => {
    fetchAndSetPlayers(); //fetch upon component mounts

    socket.on('player_joined', (player) => {
      setPlayers((prev) => [...prev, player]);
      console.log('PLayer has join .... ', player);
    });

    return () => socket.off('player_joined');
  }, [fetchAndSetPlayers]);

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
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      </div>

      <div>
        <button onClick={handleCreateRoom}>Create Room </button>
      </div>

      <h2>Room Code: {roomCode}</h2>
      <h3>Players:</h3>
      {players.map((player) => (
        <li key={player.id}>{player.username}</li>
      ))}
    </div>
  );
}
