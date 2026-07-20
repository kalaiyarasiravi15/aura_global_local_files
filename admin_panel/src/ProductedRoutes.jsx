import React from 'react';
import { Navigate } from 'react-router-dom';
import { clearAdminSession, getAdminToken } from './config';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = getAdminToken();
  if (!token) return <Navigate to="/login" replace />;
  if (isTokenExpired(token)) {
    clearAdminSession();
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
