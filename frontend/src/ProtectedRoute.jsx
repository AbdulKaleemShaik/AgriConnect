import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from './Service/useAuth'; 

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/customerlogin" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;
