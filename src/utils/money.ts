const normalizeMoney = (amount: number | null | undefined) => {
  const normalized = Number(amount);
  return Number.isFinite(normalized) ? normalized : 0;
};

export function formatMoneyFull(amount: number | null | undefined) {
  const safeAmount = normalizeMoney(amount);
  const sign = safeAmount < 0 ? '-' : '';
  return `${sign}$${Math.round(Math.abs(safeAmount)).toLocaleString('en-US')}`;
}

export function formatMoneyPerHour(amount: number | null | undefined) {
  return `${formatMoneyFull(amount)}/h`;
}

export function formatMoneyPlain(amount: number | null | undefined) {
  const safeAmount = normalizeMoney(amount);
  return Math.round(safeAmount).toLocaleString('en-US');
}
