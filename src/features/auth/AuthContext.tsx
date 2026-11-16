import React, { useEffect, useState, useMemo } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth } from '../../services/firebase';
import type { AuthContextType } from '../../types/auth';
import { AuthContext } from './authContextDef';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Escucha los cambios de estado de autenticación (login, logout, persistencia)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerUser = (email: string, pass: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email.trim(), pass);
  };

  const loginUser = (email: string, pass: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const logoutUser = (): Promise<void> => {
    return signOut(auth);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      loading,
      registerUser,
      loginUser,
      logoutUser,
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
