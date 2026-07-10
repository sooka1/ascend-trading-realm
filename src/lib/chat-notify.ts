// Small helpers to alert both parties on a new chat message:
// a short WebAudio beep + a sonner toast. No asset files required.
import { toast } from "sonner";

let ctx: AudioContext | null = null;

export function playChatChime() {
  try {
    const AC =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const notes = [880, 1320];
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  } catch {
    /* ignore audio failures */
  }
}

export function notifyIncomingMessage(title: string, description?: string) {
  playChatChime();
  toast(title, description ? { description } : undefined);
}