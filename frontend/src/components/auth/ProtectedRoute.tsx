import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  
  // 1. Get user and token from local storage (or your AuthContext)
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // 2. Check if user is logged in
  if (!token || !user) {
    // Redirect to login, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check if user has the correct role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are logged in but don't have permission, send them home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;