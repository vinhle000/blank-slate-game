import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { fetchPlayers } from '../services/roomService';
import socket from '../socket';

const GameContext = createContext();

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [prompt, setPrompt] = useState('');
  const [players, setPlayers] = useState([]);
  const [gamePhase, setGamePhase] = useState('');
  const [currentRound, setCurrentRound] = useState(null);

  const fetchAndSetPlayers = useCallback(async (roomCode) => {
    if (!roomCode) return;
    const playersData = await fetchPlayers(roomCode);
    setPlayers(playersData);
  }, []);

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
        fetchAndSetPlayers,
        gamePhase,
        setGamePhase,
        currentRound,
        setCurrentRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
