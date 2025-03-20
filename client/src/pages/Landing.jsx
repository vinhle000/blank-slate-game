import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';
import { createRoom, joinRoom } from '../services/roomService';

export default function Landing() {
  const { setUser } = useGameContext();
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    const user = await createRoom(inputUsername);
    setUser(user);
    socket.emit('join_room', { roomCode: user.roomCode, userId: user.id });
    navigate(`/lobby/${user.roomCode}`); // ✅ Redirect to Lobby
  };

  const handleJoinRoom = async () => {
    const user = await joinRoom(inputUsername, inputRoomCode);
    setUser(user);
    socket.emit('join_room', { roomCode: inputRoomCode, userId: user.id });
    navigate(`/lobby/${inputRoomCode}`); // ✅ Redirect to Lobby
  };

  return (
    <>
      <h2>Blank Slate</h2>
      <div>
        <input
          type='text'
          placeholder='Player Name'
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
        />
      </div>
      <div>
        <input
          type='text'
          placeholder='Room Code'
          value={inputRoomCode}
          onChange={(e) => setInputRoomCode(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
      <button onClick={handleCreateRoom}>Create Room</button>
    </>
  );
}
