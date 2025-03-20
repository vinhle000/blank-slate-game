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
    prompt,
    setPrompt,
    gamePhase,
    setGamePhase,
    setCurrentRound,
  } = useGameContext();
  const navigate = useNavigate();

  const handleStartGame = async () => {
    socket.emit('game_start', { roomCode: user.roomCode, players: players });
  };
  const handleExitGame = async () => {
    socket.emit('player_left', { roomCode: user.roomCode, userId: user.id });
    setUser(null);
    navigate('/'); // redirect back to landing page
  };
  useEffect(() => {
    fetchAndSetPlayers(user.roomCode); //fetch upon component mounts

    socket.on('prompt_select_phase_started', ({ prompt, currentRound }) => {
      setPrompt(prompt);
      setCurrentRound(currentRound);
      setGamePhase('prompt_select_phase');
      navigate(`/game/${user.roomCode}`);
    });

    return () => {
      socket.off('prompt_select_phase_started');
    };
  }, [fetchAndSetPlayers, navigate, user]);

  // debug logs
  // useEffect(() => {
  //   console.log(' ------- lobby logs ---- s');
  //   console.log('prompt:', prompt);
  //   console.log('gamePhase:', gamePhase);
  // }, [prompt, gamePhase]);
  return (
    <>
      <h2>LOBBY</h2>
      <h3>Room Code: {user.roomCode}</h3>
      <h3>Players in Room:</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.username}</li>
        ))}
      </ul>
      {user.isHost ? (
        <button onClick={handleStartGame}>Start Game</button>
      ) : (
        <p>Waiting for host to start the game...</p>
      )}
      <button onClick={handleExitGame}>Exit Room</button> {/* ✅ Exit Button */}
    </>
  );
}
