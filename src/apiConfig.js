const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

let rawApiUrl = import.meta.env.VITE_API_URL || (
  isLocal
    ? 'http://localhost:5001/api'
    : 'https://api.zomocook.in/api'
);

if (!isLocal && (rawApiUrl.includes('onrender.com') || rawApiUrl.includes('localhost'))) {
  rawApiUrl = 'https://api.zomocook.in/api';
}

const API_BASE_URL = rawApiUrl;
const UPLOAD_BASE_URL = API_BASE_URL.replace('/api', '');

export default API_BASE_URL;
export { UPLOAD_BASE_URL };

