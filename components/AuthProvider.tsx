'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface GoogleUser {
  id: string;
  name: string;
  picture: string;
  email: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('google_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('google_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async () => {
    try {
      const { signInWithGoogle } = await import('@/lib/google-auth');
      const userData = await signInWithGoogle();
      if (userData) {
        setUser(userData);
        localStorage.setItem('google_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      const { signOut } = await import('@/lib/google-auth');
      signOut();
      setUser(null);
      localStorage.removeItem('google_user');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}