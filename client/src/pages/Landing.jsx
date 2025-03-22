import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';
import { createRoom, joinRoom } from '../services/roomService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    const cleanedInputRoomCode = inputRoomCode.strip().toUpperCase(); //ensure input roomCode consistency
    const user = await joinRoom(inputUsername, cleanedInputRoomCode);
    setUser(user);
    socket.emit('join_room', {
      roomCode: cleanedInputRoomCode,
      userId: user.id,
    });
    navigate(`/lobby/${cleanedInputRoomCode}`); // ✅ Redirect to Lobby
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-center'>
      <h1 className='text-4xl font-bold mb-6'>Blank Slate</h1>
      <p>Join a room or start a new game!</p>
      <div>
        <div className='mt-6 flex flex-col space-y-4 w-full max-w-sm'>
          <Input
            type='text'
            placeholder='Player Name'
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            className='p-3 rounded-md '
          />
        </div>
      </div>
      <div className='mt-6 flex flex-col space-y-4 w-full max-w-sm'>
        <Input
          type='text'
          placeholder='Room Code'
          value={inputRoomCode}
          onChange={(e) => setInputRoomCode(e.target.value)}
          className='p-3 rounded-md'
        />
        <Button onClick={handleJoinRoom}>Join Room</Button>
        <Button onClick={handleCreateRoom}>Create Room</Button>
      </div>
    </div>
  );
}
