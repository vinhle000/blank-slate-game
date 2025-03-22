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
  const [winningUsers, setWinningUsers] = useState(null);

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

  useEffect(() => {
    socket.on('player_list_updated', ({ players }) => {
      setPlayers(players);
    });

    socket.on('new_game_started', () => {
      setWinningUsers(null); // ensure client winning state is null for New Game
    });

    return () => {
      socket.off('player_list_updated');
    };
  }, [setPlayers]);

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
        winningUsers,
        setWinningUsers,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
