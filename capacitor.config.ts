import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tyrialedger.collector",
  appName: "Tyria Ledger",
  webDir: "apps/android/dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
