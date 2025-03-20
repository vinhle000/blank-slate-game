import { useState, useEffect, useRef } from 'react';
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
    setPlayers,
    winningUsers,
    setWinningUsers,
  } = useGameContext();

  const [answer, setAnswer] = useState('');
  const answerRef = useRef('');

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

  const handleInputChange = async (e) => {
    setAnswer(e.target.value);
    answerRef.current = e.target.value; // Used to get most recent data, for realtime websocket events
  };

  const handleEndRound = async () => {
    socket.emit('end_round', {
      roomCode: user.roomCode,
      roomId: currentRound.id,
    }); // manually ends round, instead of waiting for Timer
  };

  // NOTE: HOST is only transition from display_answers -> show_results phase
  const handleNext = async () => {
    socket.emit('show_results', { roomCode: user.roomCode, winningUsers });
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

    socket.on('round_ended', async () => {
      console.log('Round ended! Submitting answer and updating scores...');

      socket.emit('submit_answer', {
        roomCode: user.roomCode,
        roundId: currentRound.id,
        userId: user.id,
        answer: answerRef.current,
      });
    });

    socket.on('all_answers_submitted', async () => {
      if (user.isHost) {
        console.log(
          '🟢 Host detected all answers submitted. Requesting score calculation...'
        );
        socket.emit('calculate_scores', {
          roomCode: user.roomCode,
          roundId: currentRound.id,
        });
      }
    });

    socket.on('scores_updated', ({ users }) => {
      console.log('  Received updated scores', users);
      setPlayers(users);
      setGamePhase('display_answer_phase');
    });

    socket.on('win_found', ({ winningUsers }) => {
      console.log('🏆 Winner(s) found! Storing in context and Ending game');
      setWinningUsers(winningUsers); //  Store winners in context
    });

    socket.on('showing_results', ({ gamePhase }) => {
      setGamePhase(gamePhase);
      navigate(`/results/${user.roomCode}`);
    });

    return () => {
      socket.off('prompt_changed');
      socket.off('prompt_confirmed');
      socket.off('round_ended');
      socket.off('all_answers_submitted');
      socket.off('scores_updated');
      socket.off('win_found');
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
      <div>
        GAME <span>Round# {currentRound.roundNumber}</span>
      </div>
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
              onChange={handleInputChange}
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
            {user.isHost && (
              <div>
                <button onClick={handleNext}>Next</button>
              </div>
            )}
          </>
        </>
      )}
    </>
  );
}
