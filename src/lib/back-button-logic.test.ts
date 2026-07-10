import { describe, expect, test } from "bun:test";
import { decideBackAction, fallbackPath } from "./back-button-logic";

const ORIGIN = "https://app.example.com";

describe("fallbackPath", () => {
  test("returns / for root", () => {
    expect(fallbackPath("/")).toBe("/");
    expect(fallbackPath("")).toBe("/");
  });
  test("returns / for top-level routes", () => {
    expect(fallbackPath("/auth")).toBe("/");
    expect(fallbackPath("/portal")).toBe("/");
  });
  test("returns parent path for nested routes", () => {
    expect(fallbackPath("/portal/portfolio")).toBe("/portal");
    expect(fallbackPath("/admin/users/42")).toBe("/admin/users");
  });
  test("ignores trailing slashes", () => {
    expect(fallbackPath("/portal/portfolio/")).toBe("/portal");
    expect(fallbackPath("/portal///")).toBe("/");
  });
});

describe("decideBackAction", () => {
  const base = { historyLength: 5, referrer: `${ORIGIN}/somewhere`, currentOrigin: ORIGIN };

  test("home never triggers history.back", () => {
    const a = decideBackAction({ ...base, pathname: "/" });
    expect(a).toEqual({ kind: "navigate", to: "/" });
  });

  test("auth routes always navigate to / (never back — would loop after protected redirect)", () => {
    for (const p of ["/auth", "/forgot-password", "/reset-password"]) {
      expect(decideBackAction({ ...base, pathname: p })).toEqual({
        kind: "navigate",
        to: "/",
      });
    }
  });

  test("auth routes go to / even with a fresh in-app history stack", () => {
    const a = decideBackAction({
      pathname: "/auth",
      historyLength: 20,
      referrer: `${ORIGIN}/portal`,
      currentOrigin: ORIGIN,
    });
    expect(a).toEqual({ kind: "navigate", to: "/" });
  });

  test("uses history.back when there is same-origin history", () => {
    const a = decideBackAction({ ...base, pathname: "/portal/portfolio" });
    expect(a).toEqual({ kind: "history-back" });
  });

  test("falls back to parent when referrer is cross-origin", () => {
    const a = decideBackAction({
      pathname: "/portal/portfolio",
      historyLength: 5,
      referrer: "https://google.com/search",
      currentOrigin: ORIGIN,
    });
    expect(a).toEqual({ kind: "navigate", to: "/portal" });
  });

  test("falls back to / when history length is 1 (direct link)", () => {
    const a = decideBackAction({
      pathname: "/about",
      historyLength: 1,
      referrer: "",
      currentOrigin: ORIGIN,
    });
    expect(a).toEqual({ kind: "navigate", to: "/" });
  });

  test("empty referrer counts as same-origin (typed URL, opened tab)", () => {
    const a = decideBackAction({
      pathname: "/portal/portfolio",
      historyLength: 5,
      referrer: "",
      currentOrigin: ORIGIN,
    });
    expect(a).toEqual({ kind: "history-back" });
  });

  test("malformed referrer is treated as cross-origin (no back)", () => {
    const a = decideBackAction({
      pathname: "/portal/portfolio",
      historyLength: 5,
      referrer: "::not a url::",
      currentOrigin: ORIGIN,
    });
    expect(a).toEqual({ kind: "navigate", to: "/portal" });
  });

  test("deeply nested route falls back to its immediate parent", () => {
    const a = decideBackAction({
      pathname: "/admin/users/42/edit",
      historyLength: 1,
      referrer: "",
      currentOrigin: ORIGIN,
    });
    expect(a).toEqual({ kind: "navigate", to: "/admin/users/42" });
  });
});