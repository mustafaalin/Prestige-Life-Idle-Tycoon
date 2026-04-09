import { useState, useEffect } from 'react';
import { deviceIdentity } from '../lib/deviceIdentity';
import { ensureAnonymousSession } from '../lib/auth';

export interface LocalAuthUser {
  id: string;
  role: 'local';
  isAnonymous: true;
}

export function useAuth() {
  const [user, setUser] = useState<LocalAuthUser | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const identity = deviceIdentity.initialize();
      setDeviceId(identity.deviceId);
      setUser({
        id: identity.deviceId,
        role: 'local',
        isAnonymous: true,
      });
      setIsAuthenticated(true);
      setLoading(false);

      // Supabase anonymous auth'u arka planda başlat (IAP için)
      ensureAnonymousSession().catch((err) =>
        console.warn('[Auth] Supabase anonymous session failed:', err)
      );
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    void email;
    void password;
    return {
      data: null,
      error: {
        message: 'Email/password auth is disabled in local mode.',
      },
    };
  };

  const signIn = async (email: string, password: string) => {
    void email;
    void password;
    return {
      data: null,
      error: {
        message: 'Email/password auth is disabled in local mode.',
      },
    };
  };

  const signOut = async () => {
    deviceIdentity.reset();
    setUser(null);
    setIsAuthenticated(false);
    return { error: null };
  };

  return {
    user,
    deviceId,
    isAuthenticated,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
