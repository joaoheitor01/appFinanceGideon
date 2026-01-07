// src/hooks/useRouteGuard.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useRouteGuard = (requireAuth = true, redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate(redirectTo);
      } else if (!requireAuth && user) {
        navigate('/dashboard');
      }
    }
  }, [user, loading, requireAuth, navigate, redirectTo]);

  return { user, loading };
};
