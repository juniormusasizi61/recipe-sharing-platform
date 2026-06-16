import axios from 'axios';

// Axios instance configured with base API URL from Vite env.
// Other modules import this instance to make API calls to the backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
