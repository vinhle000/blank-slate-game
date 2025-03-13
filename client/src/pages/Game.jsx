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
    socket.emit('end_round', { roomCode: user.roomCode }); // manually ends round, instead of waiting for Timer
  };

  const handleNext = async () => {
    socket.emit('show_results', { roomCode: user.roomCode });
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

    socket.on('round_ended', () => {
      console.log('round is ending... submitting answer');
      setGamePhase('display_answer_phase');
      // TODO: submit answer -> persist answer to DB -> calculate score -> update user.totalScore's
      // 1. sent post request to persist answer to DB
      // 2. call api to servie to calculate points
      // Result page will pull down players list again.
    });

    socket.on('showing_results', () => {
      navigate(`/results/${user.roomCode}`);
    });

    return () => {
      socket.off('prompt_changed');
      socket.off('prompt_confirmed');
      socket.off('round_ended');
      socket.off('showing_results');
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

      {gamePhase === 'display_answer_phase' && (
        <>
          <label>
            <span>{prompt}</span>
            <span style={{ color: 'green' }}>{answer}</span>
          </label>

          <>
            <div>
              <button onClick={handleNext}>Next</button>
            </div>
          </>
        </>
      )}
    </>
  );
}
