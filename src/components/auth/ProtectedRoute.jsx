// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    // Redirecionar para login, guardando a página atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar role específica se necessário
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;