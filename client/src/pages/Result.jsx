import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';

export default function Result() {
  const navigate = useNavigate();
  const { user, players, gamePhase } = useGameContext();

  const handleStartRound = (e) => {
    console.log('Start round button pressed');
  };
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
        {players.map((player) => (
          <li key={player.id}>
            <span>{player.username}</span>
            <span> {player.totalScore}</span>
          </li>
        ))}
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
