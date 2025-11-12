import axios from "axios";

// Auto-detect environment
const getBaseURL = () => {
  // If running on localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // If running on Vercel, use production backend
  return import.meta.env.VITE_API_URL || 'https://code-snippet-manager-oowo.vercel.app';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Debug logging
console.log('🌐 Environment:', window.location.hostname);
console.log('🌐 API BaseURL:', axiosInstance.defaults.baseURL);

export default axiosInstance;