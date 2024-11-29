// import React, { createContext, useState, useContext } from 'react';
// const UserContext = createContext();

// export const useUser = () => {
//   return useContext(UserContext);
// };


// export const UserProvider = ({ children }) => {
//   const [userDetails, setUserDetails] = useState(null);

//   return (
//     <UserContext.Provider value={{ userDetails, setUserDetails }}>
//       {children}
//     </UserContext.Provider>
//   );
// };
import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  // Initialize userDetails from localStorage or set it to null
  const [userDetails, setUserDetails] = useState(() => {
    const storedUserDetails = localStorage.getItem('userDetails');
    return storedUserDetails ? JSON.parse(storedUserDetails) : null;
  });

  // Whenever userDetails change, update localStorage
  useEffect(() => {
    if (userDetails) {
      localStorage.setItem('userDetails', JSON.stringify(userDetails));
    } else {
      localStorage.removeItem('userDetails'); // Optional: Clear if userDetails become null
    }
  }, [userDetails]);

  // Function to log out user (clears both state and localStorage)
  const logout = () => {
    setUserDetails(null);
    localStorage.removeItem('userDetails');
  };

  return (
    <UserContext.Provider value={{ userDetails, setUserDetails, logout }}>
      {children}
    </UserContext.Provider>
  );
};
