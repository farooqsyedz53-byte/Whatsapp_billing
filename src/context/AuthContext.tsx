/**
 * Authentication Context for Netlify Identity.
 * Provides user state and login/logout methods to the application.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define a minimal interface for the Netlify Identity user object
interface NetlifyUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: NetlifyUser | null;
  login: () => void;
  logout: () => void;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isReady: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NetlifyUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for the script tag in layout.tsx to load window.netlifyIdentity
    const initNetlifyIdentity = () => {
      const netlifyIdentity = (window as any).netlifyIdentity;
      if (netlifyIdentity) {
        netlifyIdentity.init();
        
        setUser(netlifyIdentity.currentUser());
        setIsReady(true);

        netlifyIdentity.on('login', (loggedUser: NetlifyUser) => {
          setUser(loggedUser);
          netlifyIdentity.close();
        });

        netlifyIdentity.on('logout', () => {
          setUser(null);
        });

        return () => {
          netlifyIdentity.off('login');
          netlifyIdentity.off('logout');
        };
      } else {
        // If not loaded yet, check again in 100ms
        setTimeout(initNetlifyIdentity, 100);
      }
    };

    initNetlifyIdentity();
  }, []);

  const login = () => {
    const netlifyIdentity = (window as any).netlifyIdentity;
    if (netlifyIdentity) {
      netlifyIdentity.open('login');
    }
  };

  const logout = () => {
    const netlifyIdentity = (window as any).netlifyIdentity;
    if (netlifyIdentity) {
      netlifyIdentity.logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to consume the authentication context */
export const useAuth = () => useContext(AuthContext);
