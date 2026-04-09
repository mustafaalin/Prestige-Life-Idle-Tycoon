import { supabase } from './supabase';
import { deviceIdentity } from './deviceIdentity';

const AUTH_USER_ID_KEY = 'idle_guy_auth_user_id';

export interface AuthSession {
  userId: string;
  isAnonymous: boolean;
}

// Eş zamanlı çağrıları önlemek için singleton promise
let _sessionPromise: Promise<AuthSession | null> | null = null;

/**
 * Anonim oturum başlatır veya mevcut oturumu döndürür.
 * Eş zamanlı çağrılarda aynı promise paylaşılır (tek kullanıcı garantisi).
 */
export function ensureAnonymousSession(): Promise<AuthSession | null> {
  if (_sessionPromise) return _sessionPromise;

  _sessionPromise = _initSession().catch((err) => {
    _sessionPromise = null; // hata durumunda tekrar denenebilsin
    console.error('[Auth] ensureAnonymousSession error:', err);
    return null;
  });

  return _sessionPromise;
}

async function _initSession(): Promise<AuthSession | null> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('[Auth] getSession error:', sessionError.message);
  }

  const user = session?.user ?? null;

  if (user) {
    localStorage.setItem(AUTH_USER_ID_KEY, user.id);
    await upsertProfile(user.id);
    console.log('[Auth] Existing session restored:', user.id);
    return { userId: user.id, isAnonymous: true };
  }

  console.log('[Auth] No existing session, signing in anonymously...');
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error('[Auth] Anonymous sign-in failed:', error.message);
    _sessionPromise = null;
    return null;
  }

  if (data.user) {
    localStorage.setItem(AUTH_USER_ID_KEY, data.user.id);
    await upsertProfile(data.user.id);
    console.log('[Auth] Anonymous session created:', data.user.id);
    return { userId: data.user.id, isAnonymous: true };
  }

  return null;
}

async function upsertProfile(authUserId: string): Promise<void> {
  const displayName = deviceIdentity.getPlayerName();
  const deviceId = deviceIdentity.getDeviceId();

  const { error } = await supabase.from('profiles').upsert(
    { id: authUserId, display_name: displayName, device_id: deviceId },
    { onConflict: 'id', ignoreDuplicates: false }
  );

  if (error) {
    console.error('[Auth] Profile upsert failed:', error.message, error);
  }
}

/**
 * Mevcut auth user ID'yi döndürür (sync, cached).
 */
export function getCachedAuthUserId(): string | null {
  return localStorage.getItem(AUTH_USER_ID_KEY);
}

/**
 * Auth state değişikliklerini dinler.
 */
export function onAuthStateChange(callback: (userId: string | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null);
  });
  return subscription;
}
