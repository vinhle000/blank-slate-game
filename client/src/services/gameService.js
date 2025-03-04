import axios from 'axios';

const API_URL = `${import.meta.VITE_API_BASE_URL}/game`;

export const startRound = async (roomCode) => {
  const response = await axios.post(`${API_URL}/start-round${roomCode}`);
  return response.data; //{ roomCode, userId }
};

// get current round || or specific round with roomCode
export const getRound = async (roomCode) => {
  try {
    const response = await axios.get(`${API_URL}/${roomCode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current round: ', error);
    return null;
  }
};
