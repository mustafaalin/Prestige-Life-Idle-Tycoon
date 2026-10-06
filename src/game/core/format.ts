// Short-scale money formatting for idle-size numbers: 999, 1.23K, 45.6M, 7.89B, 1.00T, ...
// Each language passes its own NumberStyle (see src/game/i18n); English is the default.

export interface NumberStyle {
  decimal: string;
  /** Suffix per power of 1000, starting at 10^0. */
  suffixes: string[];
  /** Put a space between the number and the suffix ("1,23 Mn" vs "1.23M"). */
  spaceBeforeSuffix: boolean;
  duration: { day: string; hour: string; minute: string; second: string };
}

export const EN_NUMBER_STYLE: NumberStyle = {
  decimal: '.',
  suffixes: ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'],
  spaceBeforeSuffix: false,
  duration: { day: 'd', hour: 'h', minute: 'm', second: 's' },
};

export function formatAmount(value: number, style: NumberStyle = EN_NUMBER_STYLE) {
  if (!Number.isFinite(value)) return '∞';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const decimal = (text: string) => (style.decimal === '.' ? text : text.replace('.', style.decimal));
  if (abs < 1000) {
    return `${sign}${abs < 10 && abs % 1 !== 0 ? decimal(abs.toFixed(1)) : Math.floor(abs)}`;
  }
  const tier = Math.min(Math.floor(Math.log10(abs) / 3), style.suffixes.length - 1);
  const scaled = abs / 1000 ** tier;
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  const space = style.spaceBeforeSuffix ? ' ' : '';
  return `${sign}${decimal(scaled.toFixed(digits))}${space}${style.suffixes[tier]}`;
}

export function formatMoney(value: number, style: NumberStyle = EN_NUMBER_STYLE) {
  return `$${formatAmount(value, style)}`;
}

/** 75 → "1m 15s", 5400 → "1h 30m", 200000 → "2d 7h". */
export function formatDuration(seconds: number, style: NumberStyle = EN_NUMBER_STYLE) {
  if (!Number.isFinite(seconds)) return '∞';
  const unit = style.duration;
  const s = Math.max(0, Math.round(seconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  // The smaller unit is dropped when it is zero: "1h", not "1h 0m".
  const pair = (big: number, bigUnit: string, small: number, smallUnit: string) =>
    small > 0 ? `${big}${bigUnit} ${small}${smallUnit}` : `${big}${bigUnit}`;
  if (days > 0) return pair(days, unit.day, hours, unit.hour);
  if (hours > 0) return pair(hours, unit.hour, minutes, unit.minute);
  if (minutes > 0) return pair(minutes, unit.minute, secs, unit.second);
  return `${secs}${unit.second}`;
}
