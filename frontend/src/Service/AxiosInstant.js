import axios from 'axios';

/** Base URL of the AgriConnect backend (no trailing slash). */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

const TOKEN_KEY = 'token';
const USER_KEY = 'userDetails';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

/** Removes the stored JWT and cached profile. */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/** Normalises "ROLE_FARMER" / "FARMER" to "FARMER". */
export const normalizeRole = (role) => (role ? String(role).replace(/^ROLE_/, '') : null);

/**
 * Turns a server-relative path such as "/images/products/x.jpg" into an absolute URL.
 * Absolute URLs (http/https/data/blob) are returned unchanged; empty values return undefined.
 */
export const assetUrl = (path) => {
  if (!path) return undefined;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Extracts a human readable message from an API error ({message, fieldErrors}).
 * Field errors are appended as "field: message".
 */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    const fieldErrors = Array.isArray(data.fieldErrors) ? data.fieldErrors : [];
    if (fieldErrors.length > 0) {
      return fieldErrors.map((fe) => `${fe.field}: ${fe.message}`).join('\n');
    }
    if (data.message) return data.message;
  }
  if (typeof data === 'string' && data.trim()) return data;
  if (!error?.response) return 'Cannot reach the server. Please check your connection.';
  return fallback;
};

/** Field errors as an object {field: message}, handy for MUI helperText. */
export const getFieldErrors = (error) => {
  const list = error?.response?.data?.fieldErrors;
  if (!Array.isArray(list)) return {};
  return list.reduce((acc, fe) => ({ ...acc, [fe.field]: fe.message }), {});
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const isAuthEndpoint = (url = '') => url.startsWith('/api/auth/');

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && !isAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !isAuthEndpoint(error.config?.url) && getToken()) {
      // Session expired or token rejected: drop credentials and send the user to the right login page.
      let role = null;
      try {
        role = normalizeRole(JSON.parse(localStorage.getItem(USER_KEY) || 'null')?.role);
      } catch {
        role = null;
      }
      clearAuth();
      const target = role === 'FARMER' ? '/farmerlogin' : '/customerlogin';
      if (window.location.pathname !== target) {
        window.location.assign(target);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
