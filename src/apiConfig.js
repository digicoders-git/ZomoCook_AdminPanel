const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5001/api')
  : 'https://api.zomocook.in/api';

const UPLOAD_BASE_URL = isLocal
  ? 'http://localhost:5001'
  : 'https://api.zomocook.in';

export default API_BASE_URL;
export { UPLOAD_BASE_URL };

