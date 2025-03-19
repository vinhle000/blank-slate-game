import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { fetchPlayers } from '../services/roomService';
import { calculateAndUpdateScores } from '../services/gameService.js';
import socket from '../socket';

const GameContext = createContext();

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [prompt, setPrompt] = useState('');
  const [players, setPlayers] = useState([]);
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(null);

  const [roomStatus, setRoomStatus] = useState('waiting');

  const fetchAndSetPlayers = useCallback(async (roomCode) => {
    if (!roomCode) return;
    const playersData = await fetchPlayers(roomCode);
    setPlayers(playersData);
  }, []);

  const handleScoreUpdate = useCallback(async () => {
    if (!currentRound) return;
    try {
      const users = await calculateAndUpdateScores(currentRound.id);
      if (users) {
        console.log('✅ Scores updated! Updating players...', users);
        setPlayers(users);
      }
    } catch (error) {
      console.error('❌ Error updating scores:', error);
    }
  }, [currentRound]);

  // useEffect(() => {
  //   if (gamePhase === 'display_answer_phase') {
  //     console.log('🔄 Entering display_answer_phase, calculating scores...');
  //     handleScoreUpdate();
  //   }
  // }, [handleScoreUpdate, gamePhase]); // Only runs when gamePhase changes

  useEffect(() => {
    socket.on('player_joined', () => {
      fetchAndSetPlayers(user.roomCode);
    });

    return () => {
      socket.off('player_joined');
    };
  }, [fetchAndSetPlayers, user.roomCode]);

  return (
    <GameContext.Provider
      value={{
        user,
        setUser,
        prompt,
        setPrompt,
        players,
        setPlayers,
        fetchAndSetPlayers,
        gamePhase,
        setGamePhase,
        currentRound,
        setCurrentRound,
        handleScoreUpdate,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
