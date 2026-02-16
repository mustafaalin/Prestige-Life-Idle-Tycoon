import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { deviceIdentity } from '../lib/deviceIdentity';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const identity = deviceIdentity.initialize();
      setDeviceId(identity.deviceId);

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        const { data: authData, error } = await supabase.auth.signInAnonymously({
          options: {
            data: {
              device_id: identity.deviceId,
            }
          }
        });

        if (error) {
          setLoading(false);
        } else if (authData?.user) {
          setUser(authData.user);
          setIsAuthenticated(true);
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
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
