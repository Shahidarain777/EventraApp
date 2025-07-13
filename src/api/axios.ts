import axios from 'axios';
import { Platform } from 'react-native';

// Get the correct IP address based on where the app is running
// Use localhost for emulator, your computer's IP address for physical devices
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // For Android emulator, localhost won't work, use 10.0.2.2 which routes to host machine
    // For physical devices, use your computer's actual IP address detected by the setup script
    return __DEV__ 
      ? 'http://192.168.2.12:3000/api'  // Development - detected IP from setup script
      : 'http://1192.168.2.12:3000/api'; // Production server
  }
  return 'http://localhost:3000/api'; // iOS simulator or production
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
