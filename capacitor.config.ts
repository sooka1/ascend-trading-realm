import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hkex.invest",
  appName: "HKEX",
  webDir: "dist",
  server: {
    url: "https://5d06956d-0893-4e53-8e16-f9255052df0e.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
};

export default config;