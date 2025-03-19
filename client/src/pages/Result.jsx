import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';

export default function Result() {
  const navigate = useNavigate();
  const { user, players, gamePhase, setPrompt, setCurrentRound, setGamePhase } =
    useGameContext();

  //Only available to Host, so only emits ONE event
  const handleStartRound = (e) => {
    console.log('Start round button pressed');
    socket.emit('next_round', user.roomCode);
  };

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
    <>
      <h1>Round Results</h1>
      <h2>
        Player: <span style={{ color: 'pink' }}>{user.username}</span>
      </h2>
      <h3>
        Room: <span style={{ color: 'yellow' }}>{user.roomCode}</span>
      </h3>
      <h3>Scores</h3>

      <div>
        <ul>
          {players.map((player) => (
            <li key={player.id}>
              <span>{player.username}</span>
              <span> {player.totalScore}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* show players and score */}

      {/* HOST - show next round button */}
      {user.isHost ? (
        <button onClick={handleStartRound}>Start Round</button>
      ) : (
        <div>Waiting for HOST to start next round</div>
      )}
    </>
  );
}
