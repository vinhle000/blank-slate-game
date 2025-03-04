import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/rooms`;

export const createRoom = async (username) => {
  const response = await axios.post(`${API_URL}/create-room`, { username });
  return response.data; //{ roomCode, userId }
};

export const joinRoom = async (username, roomCode) => {
  const response = await axios.post(`${API_URL}/join-room`, {
    username,
    roomCode,
  });
  return response.data; //{userId}
};

export const fetchPlayers = async (roomCode) => {
  if (!roomCode) return [];

  try {
    const response = await axios.get(`${API_URL}/${roomCode}/players`);
    return response.data.users; // [ {user obj }, ...]
  } catch (error) {
    console.error('Error fetching players: ', error);
    return [];
  }
};
