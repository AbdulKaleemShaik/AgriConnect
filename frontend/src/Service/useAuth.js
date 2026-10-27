import {jwtDecode} from 'jwt-decode';
import { getToken, normalizeRole } from './AxiosInstant';

/** Reads the stored JWT; role is normalised to "CUSTOMER" | "FARMER" | "ADMIN". */
const useAuth = () => {
  const token = getToken();

  if (!token) {
    return { isAuthenticated: false, role: null };
  }

  try {
    const decodedToken = jwtDecode(token);
    const isTokenExpired = decodedToken.exp * 1000 < Date.now();

    if (isTokenExpired) {
      return { isAuthenticated: false, role: null };
    }

    const role = normalizeRole(decodedToken?.role);
    return { isAuthenticated: true, role };
  } catch (error) {
    return { isAuthenticated: false, role: null };
  }
};

export default useAuth;
