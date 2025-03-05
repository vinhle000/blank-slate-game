import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import socket from '../socket';
import {
  createRoom,
  joinRoom,
  fetchPlayers,
  fetchRoomStatus,
} from '../services/roomService';

export default function Lobby() {
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [roomStatus, setRoomStatus] = useState('waiting');
  const navigate = useNavigate;

  const handleCreateRoom = async () => {
    const data = await createRoom(username);
    setRoomCode(data.roomCode);
    setUserId(data.userId);
    setIsHost(true);
    socket.emit('join_room', { roomCode: data.roomCode, userId: data.userId });
  };

  const handleJoinRoom = async () => {
    const data = await joinRoom(username, roomCode);
    setUserId(data.userId);
    socket.emit('join_room', { roomCode, userId: data.userId });

    const playersData = await fetchPlayers(roomCode);
    setPlayers(playersData);
  };

  const handleStartGame = async () => {
    socket.emit('start_round', roomCode);
  };

  const fetchAndSetPlayers = useCallback(async () => {
    const playersData = await fetchPlayers(roomCode);
    setPlayers(playersData);
  }, [roomCode]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!roomCode) return;
      const status = await fetchRoomStatus(roomCode);
      setRoomStatus(status);
    };

    checkStatus();
    fetchAndSetPlayers(); //fetch upon component mounts

    socket.on('player_joined', (player) => {
      // setPlayers((prev) => [...prev, player]);
      fetchAndSetPlayers();
    });

    socket.on('round_start_phase', () => {
      // FIXME: Change into 'game_started
      setRoomStatus('in_progress');
    });

    return () => {
      socket.off('player_joined');
      socket.off('round_start_phase'); // FIXME: Change into 'game_started
    };
  }, [fetchAndSetPlayers, roomCode]);

  useEffect(() => {
    if (roomStatus === 'in_progress') {
      navigate(`/game/${roomCode}`);
    }
  });

  return (
    <>
      {userId ? (
        <>
          <h2>
            Name:
            <span style={{ color: 'grey' }}> {username}</span>
          </h2>
          <h2>Room: {roomCode}</h2>
          <h3>Players In Game:</h3>
          {players.map((player) => (
            <li key={player.id}>{player.username}</li>
          ))}
          {isHost ? (
            <>
              {console.log('player data', players)}
              <button onClick={handleStartGame}>Begin Game</button>
            </>
          ) : (
            <p>Waiting for host to start game...</p>
          )}
        </>
      ) : (
        <>
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
        </>
      )}
    </>
  );
}
