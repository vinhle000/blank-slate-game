import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';

export default function Game() {
  const navigate = useNavigate();
  const { user } = useGameContext();

  const [answer, setAnswer] = useState('');
  const [prompt, setPrompt] = useState(''); // Host will change, but will show to all other players after 'Confirm

  // useEffect(() => {
  //   socket.on('end_current_round', () => {
  //     navigate(`result/${user.roomCode}`);
  //   });

  //   return () => {
  //     socket.off('end_current_round');
  //   };
  // });
  return (
    <>
      <h1>Game</h1>
      <h2>{user.username}</h2>

      {/* Show components for gamePhase = 'prompt_select_phase' */}
      {/* Display Prompt cue */}

      {/* Show components for gamePhase = 'answer_phase' */}
      {/* text field and save its state with handler*/}

      {/*End round button for Host
         - socket.emit('end_round'), \

      (SERVER)socket.on('end_round') will prematurely end the round
        - TimeEnd and EndRound will call the same function to emit the 'end_current_round' to client
      */}

      {/* Testing going to Result Page  */}

      {/* Show Time Remaining before Round ends */}
    </>
  );
}
