/**
 * Weekly profit distribution helper — mirrors the SQL in
 * `public.distribute_weekly_profits()`.
 *
 * A subscription's weekly return = capital × weeklyPct / 100.
 * We split it across 5 business days (Mon–Fri):
 *   - Mon..Thu: round(weekly / 5, 2)
 *   - Fri     : weekly − (sum already paid Mon..Thu)   ← absorbs rounding drift
 *
 * Property: sum(shares) === round2(capital × weeklyPct / 100) exactly.
 */
export function round2(n: number): number {
  // Postgres-style half-away-from-zero to 2 decimals, avoiding FP drift.
  return Math.sign(n) * Math.round(Math.abs(n) * 100 + Number.EPSILON) / 100;
}

export function weeklyAmount(capital: number, weeklyPct: number): number {
  return round2(capital * weeklyPct / 100);
}

/**
 * Compute the amount to credit on a given business day.
 * @param dayIndex 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
 * @param alreadyPaid sum of Mon..(dayIndex-1) shares for this subscription
 */
export function dailyShare(
  capital: number,
  weeklyPct: number,
  dayIndex: 1 | 2 | 3 | 4 | 5,
  alreadyPaid = 0,
): number {
  if (dayIndex === 5) {
    return round2(weeklyAmount(capital, weeklyPct) - alreadyPaid);
  }
  return round2(capital * weeklyPct / 100 / 5);
}

/** Full 5-day distribution for a subscription's single week. */
export function weekShares(capital: number, weeklyPct: number): [number, number, number, number, number] {
  const shares: number[] = [];
  let paid = 0;
  for (let d = 1 as 1 | 2 | 3 | 4 | 5; d <= 5; d = ((d + 1) as 1 | 2 | 3 | 4 | 5)) {
    const s = dailyShare(capital, weeklyPct, d, paid);
    shares.push(s);
    paid = round2(paid + s);
  }
  return shares as [number, number, number, number, number];
}