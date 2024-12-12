export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api'
  : 'http://localhost:3000/api';

export const API_TIMEOUT = 30000; // 30 seconds

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};