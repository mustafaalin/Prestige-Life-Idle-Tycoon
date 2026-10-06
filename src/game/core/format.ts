// Short-scale money formatting for idle-size numbers: 999, 1.23K, 45.6M, 7.89B, 1.00T, ...

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function formatAmount(value: number) {
  if (!Number.isFinite(value)) return '∞';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs < 1000) {
    return `${sign}${abs < 10 && abs % 1 !== 0 ? abs.toFixed(1) : Math.floor(abs)}`;
  }
  const tier = Math.min(Math.floor(Math.log10(abs) / 3), SUFFIXES.length - 1);
  const scaled = abs / 1000 ** tier;
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return `${sign}${scaled.toFixed(digits)}${SUFFIXES[tier]}`;
}

export function formatMoney(value: number) {
  return `$${formatAmount(value)}`;
}

/** 75 → "1m 15s", 5400 → "1h 30m", 200000 → "2d 7h". */
export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return '∞';
  const s = Math.max(0, Math.round(seconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
