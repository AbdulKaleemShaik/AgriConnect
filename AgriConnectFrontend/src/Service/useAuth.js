import {jwtDecode} from 'jwt-decode';

const useAuth = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return { isAuthenticated: false, role: null };
  }

  try {
    const decodedToken = jwtDecode(token);
    const isTokenExpired = decodedToken.exp * 1000 < Date.now();

    if (isTokenExpired) {
      return { isAuthenticated: false, role: null };
    }


    const role = decodedToken?.role; 
    return { isAuthenticated: true, role };
  } catch (error) {
    return { isAuthenticated: false, role: null };
  }
};

export default useAuth;
