import type { BankDeposit, BankDepositPlanId } from '../../types/game';

export interface BankDepositPlan {
  id: BankDepositPlanId;
  title: string;
  subtitle: string;
  durationMs: number;
  maxBalancePercent: number;
  profitMultiplier: number;
  adRequired: boolean;
  accentClass: string;
}

export const BANK_DEPOSIT_PLANS: BankDepositPlan[] = [
  {
    id: 'quick',
    title: 'Quick Deposit',
    subtitle: 'Fast flip for spare cash',
    durationMs: 3 * 60 * 1000,
    maxBalancePercent: 0.2,
    profitMultiplier: 0.1,
    adRequired: false,
    accentClass: 'from-sky-500 to-cyan-500',
  },
  {
    id: 'growth',
    title: 'Growth Deposit',
    subtitle: 'Stronger return for patient players',
    durationMs: 24 * 60 * 60 * 1000,
    maxBalancePercent: 0.35,
    profitMultiplier: 0.5,
    adRequired: false,
    accentClass: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'premium_ad',
    title: 'Premium Ad Deposit',
    subtitle: 'Longest lock, biggest multiplier',
    durationMs: 24 * 60 * 60 * 1000,
    maxBalancePercent: 0.5,
    profitMultiplier: 1,
    adRequired: true,
    accentClass: 'from-fuchsia-500 to-violet-600',
  },
];

export function getBankDepositPlan(planId: BankDepositPlanId) {
  return BANK_DEPOSIT_PLANS.find((plan) => plan.id === planId) || BANK_DEPOSIT_PLANS[0];
}

export function getEffectiveBankDepositPlan(planId: BankDepositPlanId, hasPremiumCard = false) {
  const plan = getBankDepositPlan(planId);

  if (!hasPremiumCard) {
    return plan;
  }

  return {
    ...plan,
    profitMultiplier: plan.profitMultiplier * 2,
  };
}

export function getBankDepositMaxAmount(totalMoney: number, planId: BankDepositPlanId) {
  const plan = getBankDepositPlan(planId);
  const rawMaxAmount = Math.max(0, Math.floor(totalMoney * plan.maxBalancePercent));
  return Math.floor(rawMaxAmount / 100) * 100;
}

export function createBankDeposit(params: {
  planId: BankDepositPlanId;
  principal: number;
  hasPremiumCard?: boolean;
  startedAt?: number;
}): BankDeposit {
  const plan = getEffectiveBankDepositPlan(params.planId, params.hasPremiumCard);
  const startedAt = params.startedAt ?? Date.now();
  const principal = Math.max(0, Math.floor(params.principal));
  const profit = Math.floor(principal * plan.profitMultiplier);

  return {
    id: `bank-deposit-${startedAt}-${Math.random().toString(36).slice(2, 8)}`,
    plan_id: plan.id,
    principal,
    profit,
    started_at: new Date(startedAt).toISOString(),
    matures_at: new Date(startedAt + plan.durationMs).toISOString(),
    ad_required: plan.adRequired,
    ad_completed: !plan.adRequired,
  };
}

export function isBankDepositReady(deposit: BankDeposit, now = Date.now()) {
  return new Date(deposit.matures_at).getTime() <= now;
}

export function getBankDepositCountdownMs(deposit: BankDeposit, now = Date.now()) {
  return Math.max(0, new Date(deposit.matures_at).getTime() - now);
}
