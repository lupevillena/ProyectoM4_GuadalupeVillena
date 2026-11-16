import type { User, UserCredential } from 'firebase/auth';

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  registerUser: (email: string, pass: string) => Promise<UserCredential>;
  loginUser: (email: string, pass: string) => Promise<UserCredential>;
  logoutUser: () => Promise<void>;
}

