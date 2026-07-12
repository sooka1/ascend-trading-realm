/**
 * Realtime multiplexer — Sprint 3
 *
 * Additive helper that lets many components subscribe to the same
 * Supabase Realtime topic through a single physical channel. Provides:
 *   - subscription multiplexing (1 channel per topic, N listeners)
 *   - event deduplication (by payload hash + commit_timestamp)
 *   - event batching (coalesce bursts into a single microtask flush)
 *   - backpressure protection (drop-oldest when queue exceeds limit)
 *   - reconnect optimization (shared channel = 1 reconnect for all subs)
 *
 * NOTE: Purely opt-in. Existing direct `supabase.channel(...)` code paths
 * continue to work unchanged.
 */
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Listener = (payload: unknown) => void;

interface TopicState {
  channel: RealtimeChannel;
  listeners: Set<Listener>;
  queue: unknown[];
  seen: Set<string>;
  flushScheduled: boolean;
}

const MAX_QUEUE = 500; // backpressure threshold per topic
const SEEN_TTL = 2000; // dedup window in items
const topics = new Map<string, TopicState>();

function hashPayload(p: any): string {
  // Cheap dedup key: table + commit_timestamp + primary key if present
  const t = p?.table ?? "";
  const ts = p?.commit_timestamp ?? "";
  const id = p?.new?.id ?? p?.old?.id ?? "";
  const ev = p?.eventType ?? "";
  return `${t}|${ts}|${id}|${ev}`;
}

function scheduleFlush(state: TopicState) {
  if (state.flushScheduled) return;
  state.flushScheduled = true;
  queueMicrotask(() => {
    state.flushScheduled = false;
    if (state.queue.length === 0) return;
    const batch = state.queue.splice(0, state.queue.length);
    for (const listener of state.listeners) {
      for (const item of batch) {
        try { listener(item); } catch { /* isolate */ }
      }
    }
  });
}

interface SubOptions {
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  schema?: string;
  table: string;
  filter?: string;
}

/**
 * Subscribe to a Postgres-changes topic through the shared multiplexer.
 * Returns an unsubscribe function.
 */
export function subscribePostgres(
  topicKey: string,
  opts: SubOptions,
  listener: Listener,
): () => void {
  let state = topics.get(topicKey);
  if (!state) {
    const channel = supabase.channel(`mux:${topicKey}`);
    const created: TopicState = {
      channel,
      listeners: new Set(),
      queue: [],
      seen: new Set(),
      flushScheduled: false,
    };
    state = created;
    channel.on(
      // Cast is required: supabase-js typings for 'postgres_changes' are narrow.
      "postgres_changes" as any,
      {
        event: opts.event ?? "*",
        schema: opts.schema ?? "public",
        table: opts.table,
        ...(opts.filter ? { filter: opts.filter } : {}),
      },
      (payload: any) => {
        const key = hashPayload(payload);
        if (created.seen.has(key)) return; // dedup
        created.seen.add(key);
        if (created.seen.size > SEEN_TTL) {
          // trim oldest ~half
          const arr = Array.from(created.seen);
          created.seen = new Set(arr.slice(arr.length / 2));
        }
        if (created.queue.length >= MAX_QUEUE) {
          created.queue.shift(); // backpressure: drop oldest
        }
        created.queue.push(payload);
        scheduleFlush(created);
      },
    );
    channel.subscribe();
    topics.set(topicKey, created);
  }
  state.listeners.add(listener);
  return () => {
    const s = topics.get(topicKey);
    if (!s) return;
    s.listeners.delete(listener);
    if (s.listeners.size === 0) {
      supabase.removeChannel(s.channel);
      topics.delete(topicKey);
    }
  };
}

/** Diagnostic snapshot for monitoring dashboards. */
export function realtimeMultiplexerStats() {
  const out: Array<{ topic: string; listeners: number; queued: number }> = [];
  for (const [topic, s] of topics) {
    out.push({ topic, listeners: s.listeners.size, queued: s.queue.length });
  }
  return out;
}