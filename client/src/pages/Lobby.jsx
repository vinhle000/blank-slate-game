import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';
import { createRoom, joinRoom, fetchPlayers } from '../services/roomService';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    setWinningUsers,
  } = useGameContext();
  const navigate = useNavigate();

  const handleStartGame = async () => {
    setWinningUsers(null);
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
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <div className='header-place-holder flex flex-row justify-between'>
          <span className='p-8 bg-red-400'>
            {user.isHost && <span>Host: </span>} {user.username}
          </span>
          <span className='p-3 bg-blue-400'>{user.roomCode}</span>
        </div>
        <Card className='p-4 w-full max-w-md'>
          <h3 className='text-xl mb-1'>Players:</h3>
          <ul className=''>
            {players.map((player) => (
              <li className='space-y-1' key={player.id}>
                {player.username}
              </li>
            ))}
          </ul>
          {user.isHost ? (
            <Button onClick={handleStartGame}>Start Game</Button>
          ) : (
            <p>Waiting for host to start the game...</p>
          )}
          <Button onClick={handleExitGame}>Exit Room</Button>{' '}
          {/* ✅ Exit Button */}
        </Card>
      </div>
      <h2>LOBBY</h2>
      <h3>Room Code: {user.roomCode}</h3>
      <h3>Players in Room:</h3>
    </>
  );
}
