/**
 * Centralized business rules — the single client-side source of truth for
 * money math and state transitions. These mirror the authoritative rules
 * enforced by database triggers/functions (deposits, withdrawals,
 * subscriptions, competition entries, copy trading, profit distribution,
 * referral rewards).
 *
 * The DATABASE is always authoritative. These helpers exist so UI
 * validation, optimistic updates, and preview calculations do not
 * hardcode business constants in components.
 */

/** Referral commission rate on approved deposits (mirrors handle_deposit_referral). */
export const REFERRAL_RATE = 0.1;

/** Weekly target-return distribution: 5 trading days (Mon..Fri) — mirrors distribute_weekly_profits. */
export const TRADING_DAYS_PER_WEEK = 5;

/** Duplicate-action debounce window enforced by DB triggers. */
export const DUPLICATE_ACTION_WINDOW_MS = 10_000;

/** Default fiat currency used across the platform. */
export const DEFAULT_CURRENCY = "USD";

// ─── Balance ─────────────────────────────────────────────────────────────

export type AmountRow = { amount: number | string; status?: string };
export type FeeRow = { tier_fee: number | string; status?: string };

const num = (v: number | string) => Number(v) || 0;
const sum = <T,>(rows: T[], get: (r: T) => number) => rows.reduce((s, r) => s + get(r), 0);

/** Sum a status-filtered amount column. */
export const sumApproved = (rows: AmountRow[], statuses: string[] = ["approved"]) =>
  sum(rows.filter((r) => statuses.includes(r.status ?? "")), (r) => num(r.amount));

export const sumCommitted = (rows: AmountRow[], statuses: string[] = ["active", "pending"]) =>
  sum(rows.filter((r) => statuses.includes(r.status ?? "")), (r) => num(r.amount));

export const sumCompetitionFees = (rows: FeeRow[], statuses: string[] = ["active", "pending"]) =>
  sum(rows.filter((r) => statuses.includes(r.status ?? "")), (r) => num(r.tier_fee));

/**
 * Available balance formula — mirrors subscribe_to_master / enter_competition
 * server-side calculation:
 *   available = approved_deposits + profits − approved_withdrawals
 *               − committed_subs − committed_competitions − committed_copy
 */
export function computeAvailable(inputs: {
  approvedDeposits: number;
  profits: number;
  approvedWithdrawals: number;
  committedSubscriptions: number;
  committedCompetitions: number;
  committedCopy?: number;
}): number {
  const gross = inputs.approvedDeposits + inputs.profits - inputs.approvedWithdrawals;
  const committed =
    inputs.committedSubscriptions + inputs.committedCompetitions + (inputs.committedCopy ?? 0);
  return Math.max(0, gross - committed);
}

// ─── Rewards & fees ──────────────────────────────────────────────────────

export const referralReward = (depositAmount: number) =>
  Math.round(depositAmount * REFERRAL_RATE * 100) / 100;

export const dailyTargetReturn = (capital: number, weeklyTargetPct: number) =>
  Math.round(((capital * weeklyTargetPct) / 100 / TRADING_DAYS_PER_WEEK) * 100) / 100;

export const managementFee = (aum: number, annualPct: number, periodDays = 30) =>
  Math.round(((aum * annualPct) / 100) * (periodDays / 365) * 100) / 100;

export const performanceFee = (grossProfit: number, feePct: number) =>
  grossProfit > 0 ? Math.round(grossProfit * (feePct / 100) * 100) / 100 : 0;

// ─── Validation guards (UI-side pre-checks) ──────────────────────────────

export function assertPositive(value: number, field = "amount"): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be > 0`);
  }
}

export function hasSufficient(available: number, requested: number): boolean {
  return available + 1e-6 >= requested;
}