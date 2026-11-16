import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface PublicRouteProps {
  children?: React.ReactNode;
}

/**
 * Rutas exclusivas para invitados (Login, Registro).
 * Si el usuario ya está autenticado, lo redirige directamente al Dashboard.
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando..." />;
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

