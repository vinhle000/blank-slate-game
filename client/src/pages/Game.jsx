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

  const [answer, setAnswer] = useState('');

  const handleChangePrompt = async () => {
    socket.emit('change_prompt'); // will get new random prompt from server
  };

  const handleConfirm = async () => {
    socket.emit('confirm_prompt', {
      prompt,
      roundId: currentRound.id,
      roomCode: user.roomCode,
    });
  };

  const handleEndRound = async () => {
    socket.emit('end_round'); // manually ends round, instead of waiting for Timer
  };

  useEffect(() => {
    socket.on('prompt_changed', ({ prompt }) => {
      setPrompt(prompt);
    });
    socket.on('prompt_confirmed', ({ round }) => {
      console.log('prompt_confirmed received, round -> ', round);
      setPrompt(round.prompt);
      setCurrentRound(round);
      setGamePhase('answer_phase');
    });
    socket.on('end_round', () => {
      navigate(`result/${user.roomCode}`);
    });

    return () => {
      socket.off('prompt_changed');
      socket.off('prompt_confirmed');
      socket.off('end_round');
    };
  }, [navigate, setPrompt, setCurrentRound, setGamePhase, user.roomCode]);

  // debug logs
  // useEffect(() => {
  //   console.log('currentRound:', currentRound);
  //   console.log('prompt:', prompt);
  //   console.log('gamePhase:', gamePhase);
  // }, [currentRound, prompt, gamePhase]);

  return (
    <>
      <div>GAME page</div>
      <h2>
        Player: <span style={{ color: 'pink' }}>{user.username}</span>
      </h2>
      <h3>
        Room: <span style={{ color: 'yellow' }}>{user.roomCode}</span>
      </h3>

      {gamePhase === 'prompt_select_phase' && (
        <>
          <div> Prompt select phase </div>
          {user.isHost ? (
            <>
              <div>{prompt}</div>
              <div>
                <button onClick={handleChangePrompt}>Change Prompt</button>
              </div>
              <div>
                <button onClick={handleConfirm}>Confirm</button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p>Waiting for host to confirm prompt for game...</p>
              </div>
            </>
          )}
        </>
      )}

      {gamePhase === 'answer_phase' && (
        <>
          <label>
            <span>{prompt}</span>

            <input
              placeholder='input your answer'
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>

          {user.isHost ? (
            <>
              <div>
                <button onClick={handleEndRound}>End Round</button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p>place holder, shows on NON host players</p>
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
