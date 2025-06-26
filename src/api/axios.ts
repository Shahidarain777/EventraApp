import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.14.136:3000/api', // replace with your real base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
