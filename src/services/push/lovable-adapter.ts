import type { PushService } from "./types";

export const nativePushService: PushService = {
  async initialize() {
    const mod: any = await import("@/lib/native/push");
    await mod.initializePush?.();
  },
  async registerCurrentUser() {
    const mod: any = await import("@/lib/native/push");
    await mod.registerPushForCurrentUser?.();
  },
  async revokeCurrentUser() {
    const mod: any = await import("@/lib/native/push");
    await mod.revokePushForCurrentUser?.();
  },
};