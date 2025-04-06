import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import socket from '../socket';
import { createRoom, joinRoom } from '../services/roomService';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
    const cleanedInputRoomCode = inputRoomCode.trim().toUpperCase(); //ensure input roomCode consistency
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
        {/* <Input
          type='text'
          placeholder='Room Code'
          value={inputRoomCode}
          onChange={(e) => setInputRoomCode(e.target.value)}
          className='p-3 rounded-md'
        />
        <Button onClick={handleJoinRoom}>Join Room</Button> */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Join Room</Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w[425px]'>
            <DialogHeader>
              <DialogTitle>Please Enter Room Code</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <Input
              type='text'
              placeholder='Room Code'
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value)}
              className='p-3 rounded-md'
            />
            <DialogFooter>
              <Button
                onClick={handleJoinRoom}
                disabled={!inputRoomCode || !inputUsername}
                className='mt-4'
              >
                Join Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button onClick={handleCreateRoom} disabled={!inputUsername}>
          Create Room
        </Button>
      </div>
    </div>
  );
}
