import axios from 'axios';
import { Platform } from 'react-native';

// In a real scenario, use your machine's LAN IP address (e.g., 192.168.1.X) instead of localhost
// so it works on physical devices.
// For Android Emulator, use 10.0.2.2
// For iOS Simulator, localhost is fine IF running on same machine, but for Expo Go on phone, needs IP.

// Backend port changed to 4000 to avoid conflicts
// iOS Simulator uses localhost, Android Emulator uses 10.0.2.2
// For physical devices, use your machine's LAN IP address
const DEV_API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:4000/api' 
  : 'http://localhost:4000/api';

// NOTE: If you are running on a physical device, make sure this IP matches your computer's local IP
// You can find it by running: ifconfig | grep "inet " | grep -v 127.0.0.1

const api = axios.create({
  baseURL: DEV_API_URL,
});

export default api;
