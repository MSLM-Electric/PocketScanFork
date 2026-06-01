// pocket-scan-app/services/api.js
const API_URL = 'http://192.168.1.XX:3000/api'; // IP вашего ноутбука в сети

export const fetchScores = async () => {
  const response = await fetch(`${API_URL}/scores`);
  return await response.json();
};

export const submitScore = async (nickname, score) => {
  const response = await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, score }),
  });
  return response.ok;
};