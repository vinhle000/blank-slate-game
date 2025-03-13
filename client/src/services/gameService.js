import axios from 'axios';

//Use `import.meta.env.VITE_*` for Vite environment variables
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/game`;

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

export const submitAnswer = async (roomId, userId, answer) => {
  try {
    const requestBody = {
      roomId,
      userId,
      answer,
    };

    const response = await axios.post(`${API_URL}/submit-answer`, requestBody);
    console.log(
      ' gameService / submitAnswer response data = , ',
      response.data
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting Answer to server: ', error);
  }
};
