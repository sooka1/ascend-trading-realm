import { describe, expect, test } from "bun:test";
import { dailyShare, round2, weekShares, weeklyAmount } from "./profit-distribution";

/**
 * Property test: for every (capital, weeklyPct) case, the 5 daily shares
 * must sum exactly to the weekly return (round to 2 decimals), and each
 * share is non-negative.
 */
const CASES: Array<[number, number]> = [
  [500, 3],
  [1000, 2.5],
  [100, 1],
  [100, 1.1],
  [100, 0.07], // rounding-hostile: 0.07/5 = 0.014 → 0.01 → Friday absorbs 0.03
  [1234.56, 1.75],
  [10, 0.5],
  [999.99, 4.321],
  [7, 2],
  [50_000, 1.85],
  [123.45, 0.33],
  [1, 0.01], // tiny amounts still balance
  [250_000, 5],
  [3333.33, 1.11],
];

describe("weekShares — 5 daily shares sum to the weekly return exactly", () => {
  for (const [capital, pct] of CASES) {
    test(`capital=${capital} weeklyPct=${pct}%`, () => {
      const shares = weekShares(capital, pct);
      const weekly = weeklyAmount(capital, pct);
      expect(shares).toHaveLength(5);
      for (const s of shares) expect(s).toBeGreaterThanOrEqual(0);
      const sum = round2(shares.reduce((a, b) => a + b, 0));
      expect(sum).toBe(weekly);
    });
  }
});

describe("dailyShare — Mon..Thu are the flat share, Fri absorbs remainder", () => {
  test("100 × 0.07% distributes 0.01 four times then 0.03 on Friday", () => {
    const flat = dailyShare(100, 0.07, 1, 0);
    expect(flat).toBe(0.01);
    const fri = dailyShare(100, 0.07, 5, round2(flat * 4));
    expect(fri).toBe(round2(weeklyAmount(100, 0.07) - flat * 4));
    expect(round2(flat * 4 + fri)).toBe(weeklyAmount(100, 0.07));
  });

  test("500 × 3% splits evenly (no drift)", () => {
    const shares = weekShares(500, 3);
    expect(shares).toEqual([3, 3, 3, 3, 3]);
    expect(round2(shares.reduce((a, b) => a + b, 0))).toBe(15);
  });
});

describe("randomized property check", () => {
  test("500 random (capital, pct) pairs always balance", () => {
    // deterministic PRNG for reproducibility
    let seed = 0x9e3779b9;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    for (let i = 0; i < 500; i++) {
      const capital = round2(rand() * 100_000);
      const pct = round2(rand() * 10);
      const shares = weekShares(capital, pct);
      const sum = round2(shares.reduce((a, b) => a + b, 0));
      expect(sum).toBe(weeklyAmount(capital, pct));
    }
  });
});