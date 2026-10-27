import React, { createContext, useState, useContext, useEffect } from 'react';
import { clearAuth } from '../Service/AxiosInstant';
import readAuth from '../Service/useAuth'; // plain function, safe outside components

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  // Initialize userDetails (the UserResponse from GET /api/users/me) from localStorage
  const [userDetails, setUserDetails] = useState(() => {
    // A cached profile is only meaningful while the stored JWT is still valid
    if (!readAuth().isAuthenticated) {
      clearAuth();
      return null;
    }
    try {
      const storedUserDetails = localStorage.getItem('userDetails');
      return storedUserDetails ? JSON.parse(storedUserDetails) : null;
    } catch {
      return null;
    }
  });

  // Whenever userDetails change, update localStorage
  useEffect(() => {
    if (userDetails) {
      localStorage.setItem('userDetails', JSON.stringify(userDetails));
    } else {
      localStorage.removeItem('userDetails');
    }
  }, [userDetails]);

  // Log out: clears the JWT, the cached profile and the in-memory state
  const logout = () => {
    clearAuth();
    setUserDetails(null);
  };

  return (
    <UserContext.Provider value={{ userDetails, setUserDetails, logout }}>
      {children}
    </UserContext.Provider>
  );
};
