import { useEffect, useState } from 'react';
import type { PlayerProfile } from '../types/game';

export interface BoostStatus {
  active: boolean;
  multiplier: number;
  remainingLabel: string;
}

function parseExpiry(isoOrNull: string | null | undefined): number {
  if (!isoOrNull) return 0;
  return new Date(isoOrNull).getTime();
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '';
  const totalSeconds = Math.ceil(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}s ${m.toString().padStart(2, '0')}d`;
  if (m > 0) return `${m}d ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

function computeStatus(expiresAt: number, now: number): BoostStatus {
  const remaining = expiresAt - now;
  const active = remaining > 0;
  return {
    active,
    multiplier: active ? 2 : 1,
    remainingLabel: active ? formatRemaining(remaining) : '',
  };
}

export interface ActiveBoosts {
  business: BoostStatus;
  investment: BoostStatus;
  total: BoostStatus;
}

export function useBoosts(profile: PlayerProfile | null): ActiveBoosts {
  const [now, setNow] = useState(() => Date.now());

  const bizExpiry = parseExpiry(profile?.business_boost_expires_at);
  const invExpiry = parseExpiry(profile?.investment_boost_expires_at);
  const totalExpiry = parseExpiry(profile?.income_boost_expires_at);
  const anyActive = now < bizExpiry || now < invExpiry || now < totalExpiry;

  useEffect(() => {
    if (!anyActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [anyActive]);

  return {
    business: computeStatus(bizExpiry, now),
    investment: computeStatus(invExpiry, now),
    total: computeStatus(totalExpiry, now),
  };
}
