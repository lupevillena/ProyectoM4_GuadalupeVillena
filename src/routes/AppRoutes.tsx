import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas (Solo accesibles si NO hay sesión activa) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas (Requieren usuario autenticado) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirección por defecto de la raíz al Dashboard (o Login si no hay sesión) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Ruta comodín para capturar cualquier ruta no encontrada */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

