import axios from 'axios';
import { Platform } from 'react-native';

// Production API URL
const PRODUCTION_API_URL = 'https://kariyer-rota-api.magicdigital.org/api';

// Development API URLs
// For Android Emulator, use 10.0.2.2
// For iOS Simulator, localhost is fine IF running on same machine
// For physical devices, use your machine's LAN IP address
const DEV_API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:4000/api'
  : 'http://192.168.68.100:4000/api';

// Use environment variable or default to production
// Set EXPO_PUBLIC_API_URL in .env file to override
// For development: EXPO_PUBLIC_API_URL=http://localhost:4000/api
// For production: EXPO_PUBLIC_API_URL=https://kariyer-rota-api.magicdigital.org/api (default)
const API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? DEV_API_URL : PRODUCTION_API_URL);

// Log API URL in development
if (__DEV__) {
  console.log(`[API] Using API URL: ${API_URL}`);
}

// NOTE: If you are running on a physical device in development mode,
// make sure the IP matches your computer's local IP
// You can find it by running: ifconfig | grep "inet " | grep -v 127.0.0.1

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging (development only)
if (__DEV__) {
  api.interceptors.request.use(
    (config) => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('[API] Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for logging (development only)
  api.interceptors.response.use(
    (response) => {
      console.log(`[API] Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('[API] Response Error:', error.response?.status, error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

export default api;
