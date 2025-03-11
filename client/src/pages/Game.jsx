import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import {} from '../services/gameService';
import { useGameContext } from '../context/GameContext';

export default function Game() {
  const { user } = useGameContext();

  return (
    <>
      <h1>Game</h1>
      <h2>{user.username}</h2>

      {/* //Testing going to Result Page  */}

      {/* Sho */}
    </>
  );
}
