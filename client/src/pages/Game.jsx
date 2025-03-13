import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';

export default function Game() {
  const navigate = useNavigate();
  const {
    user,
    prompt,
    setPrompt,
    gamePhase,
    setGamePhase,
    currentRound,
    setCurrentRound,
  } = useGameContext();

  const { isPromptConfirmed, setIsPromptConfirmed } = useState(false);
  const [answer, setAnswer] = useState('');

  const handleChangePrompt = async () => {
    socket.emit('change_prompt'); // will get new random prompt from server
  };
  const handleConfirm = async () => {
    socket.emit('confirm_prompt', { prompt, roundId: currentRound.id });
    // set selected state to True
    // on confirm - save to setPrompt(newPrompt)
  };
  useEffect(() => {
    socket.on('prompt_changed', ({ prompt }) => {
      setPrompt(prompt);
    });
    socket.on('confirm_prompt', (currentRound) => {
      setPrompt(currentRound.prompt);
      setCurrentRound(currentRound);
      setGamePhase('answer_phase');
    });
    socket.on('end_current_round', () => {
      navigate(`result/${user.roomCode}`);
    });

    return () => {
      socket.off('end_current_round');
    };
  });
  return (
    <>
      <h2>
        Player: <span style={{ color: 'pink' }}>{user.username}</span>
      </h2>
      <h3>
        Room: <span style={{ color: 'yellow' }}>{user.roomCode}</span>
      </h3>

      {/* Show components for gamePhase = 'prompt_select_phase' */}
      {gamePhase === 'prompt_select_phase' && (
        <>
          <div> Prompt select phase </div>
          {/* Show Host buttons */}
          {user.isHost ? (
            <>
              <div>{prompt}</div>
              <div>
                <button onClick={handleChangePrompt}>Change Prompt</button>
              </div>
              <div>
                <button onClick={handleConfirm}>Submit</button>
              </div>
            </>
          ) : (
            <>
              <div>
                <text>Waiting for host to select prompt</text>
              </div>
            </>
          )}
        </>
      )}
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
