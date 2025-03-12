import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';

import socket from '../socket';
import { createRoom, joinRoom, fetchPlayers } from '../services/roomService';

export default function Lobby() {
  const {
    user,
    setUser,
    players,
    fetchAndSetPlayers,
    setPrompt,
    setGamePhase,
  } = useGameContext();

  const [inputRoomCode, setInputRoomCode] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    const user = await createRoom(inputUsername);
    setUser(user);
    socket.emit('join_room', { roomCode: user.roomCode, userId: user.id }); // Room code was assigned in server endpoint when saving to DB
  };

  const handleJoinRoom = async () => {
    const user = await joinRoom(inputUsername, inputRoomCode);
    setUser(user);
    socket.emit('join_room', { roomCode: inputRoomCode, userId: user.id }); // Room code is from input text field
  };

  const handleStartGame = async () => {
    socket.emit('game_start', user.roomCode);
  };

  useEffect(() => {
    fetchAndSetPlayers(user.roomCode); //fetch upon component mounts

    socket.on('prompt_select_phase_started', ({ prompt }) => {
      setPrompt(prompt);
      setGamePhase('prompt_select_phase');
      navigate(`/game/${user.roomCode}`);
    });

    return () => {
      socket.off('prompt_select_phase_started');
    };
  }, [fetchAndSetPlayers, navigate, user]);

  return (
    <>
      {user?.id ? (
        <>
          <h2>
            Name:
            <span style={{ color: 'grey' }}> {inputUsername}</span>
          </h2>
          <h2>Room: {user.roomCode}</h2>
          <h3>Players In Game:</h3>
          {players.map((player) => (
            <li key={player.id}>{player.username}</li>
          ))}
          {user.isHost ? (
            <>
              {console.log('player data', players)}
              <button onClick={handleStartGame}>Start Game</button>
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
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              type='text'
              placeholder='Room Code'
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value)}
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
