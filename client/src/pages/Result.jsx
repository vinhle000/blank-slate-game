import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Result() {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    players,
    gamePhase,
    winningUsers,
    setWinningUsers,
    setPrompt,
    setCurrentRound,
    setGamePhase,
  } = useGameContext();

  const handleQuitGame = () => {
    socket.emit('player_left', { roomCode: user.roomCode, userId: user.id });
    setUser(null);
    navigate('/'); // redirect back to landing page
  };

  const handlePlayAgain = () => {
    setGamePhase('waiting');
    setCurrentRound(null);
    setWinningUsers(null);
    navigate(`/lobby/${user.roomCode}`);
  };

  //Only available to Host, so only emits ONE event
  const handleStartRound = (e) => {
    console.log('Start round button pressed');
    socket.emit('next_round', user.roomCode);
  };

  // IF HOST starts game and users are still on Results page, they will automatically be joined in the next game
  useEffect(() => {
    socket.on('prompt_select_phase_started', ({ currentRound, prompt }) => {
      setGamePhase('prompt_select_phase');
      setCurrentRound(currentRound);
      setPrompt(prompt);
      navigate(`/game/${user.roomCode}`);
    });

    return () => {
      socket.off('prompt_select_phase_started');
    };
  }, [setGamePhase, setCurrentRound, setPrompt, setPrompt, navigate]);
  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <div className='header-place-holder flex flex-row justify-between'>
        <span className='p-8 bg-red-400'>
          {user.isHost && <span>Host: </span>} {user.username}
        </span>
        <span className='p-3 bg-blue-400'>{user.roomCode}</span>
      </div>

      <Card className='p-6 w-full max-w-md'>
        <h3 className='text-xl mb-1'>Scores</h3>

        <div>
          <ul>
            {players.map((player) => (
              <li
                className='p-6 flex flex-row items-center justify-between space-y-1'
                key={player.id}
              >
                <span>{player.username}</span>
                <span> {player.totalScore}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* show players and score */}

        {/* WIN has occured  - GAME END*/}
        {winningUsers ? (
          <>
            {/* Show User IS the winner */}
            {winningUsers.map((user) => user.id).includes(user.id) ? (
              <div>
                <h2 className='font-bold'> YOU WIN!!! 🎉</h2>
              </div>
            ) : (
              <div>
                {' '}
                {/* Show User is NOT the winner */}
                <h3>
                  {' '}
                  Player(s){' '}
                  <span className='font-bold'>
                    {winningUsers.map((user) => user.username).join(', ')}
                  </span>{' '}
                  have won the game!{' '}
                </h3>
              </div>
            )}
            {/* Display quit and play again button */}
            <div className='flex flex-row item-center justify-around'>
              <Button onClick={handleQuitGame}>Quit</Button>
              <Button onClick={handlePlayAgain}>Play Again</Button>
            </div>
          </>
        ) : (
          <>
            {/* Game is still in prgoress*/}
            {/* HOST - show next round button */}
            {user.isHost ? (
              <Button onClick={handleStartRound}>Start Round</Button>
            ) : (
              <div>Waiting for HOST to start next round</div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
