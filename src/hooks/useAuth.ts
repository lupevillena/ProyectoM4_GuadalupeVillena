import { useContext } from 'react';
import { AuthContext } from '../features/auth/authContextDef';
import type { AuthContextType } from '../types/auth';

/**
 * Custom hook para consumir el contexto de autenticación en cualquier componente.
 * Lanza un error amigable si se utiliza fuera de un AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un <AuthProvider>');
  }

  return context;
}
