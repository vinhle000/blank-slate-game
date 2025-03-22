import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';

import Header from '@/components/Header';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <Header username={user.username} roomCode={user.roomCode} />

      <Card className='p-6 w-full max-w-md'>
        {gamePhase === 'prompt_select_phase' && (
          <>
            {user.isHost ? (
              <div className='mt-6 flex flex-col space-y-4'>
                <Card className='items-center text-lg font-bold'>{prompt}</Card>
                <div className='mt-10 space-y-5 flex flex-col'>
                  <Button onClick={handleChangePrompt}>Change Prompt</Button>

                  <Button onClick={handleConfirm}>Confirm</Button>
                </div>
              </div>
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
            <div className='flex flex-row'>
              <p className='mx-1 px-2 inline-flex items-center font-bold'>
                {prompt.split(' ')[0]}__{' '}
                {/* temp fix cause of extra space in .json data*/}
              </p>

              <div className=''>
                <Input
                  placeholder='input your answer'
                  value={answer}
                  onChange={handleInputChange}
                  // className='inline'
                />
              </div>
            </div>

            {user.isHost ? (
              <>
                <div>
                  <Button onClick={handleEndRound}>End Round</Button>
                </div>
              </>
            ) : (
              <>
                <div className='inline-flex items-center justify-center '>
                  <p className='text-gray-400 text-xs '>
                    Wait for Host to end round
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {gamePhase === 'display_answer_phase' && (
          <>
            <div className='flex flex-row items-end justify-center'>
              <span className='text-base'>{prompt.split(' ')[0]}</span>
              <span className='text-6xl underline decoration-[.2rem]'>
                {answer}
              </span>
            </div>

            <>
              {user.isHost && (
                <div>
                  <Button onClick={handleNext}>Next</Button>
                </div>
              )}
            </>
          </>
        )}
      </Card>
    </div>
  );
}
