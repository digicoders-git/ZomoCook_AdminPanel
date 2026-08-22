const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  isLocal
    ? 'http://localhost:5001/api'
    : 'https://api.zomocook.in/api'
);

const UPLOAD_BASE_URL = API_BASE_URL.replace('/api', '');

export default API_BASE_URL;
export { UPLOAD_BASE_URL };
