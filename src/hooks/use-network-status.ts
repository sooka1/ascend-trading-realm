import { useEffect, useState } from "react";
import { getNetStatus, onNetStatus, type NetStatus } from "@/lib/native/network-queue";

export function useNetworkStatus(): NetStatus {
  const [status, setStatus] = useState<NetStatus>(() => getNetStatus());
  useEffect(() => {
    const unsub = onNetStatus(setStatus);
    return () => { unsub(); };
  }, []);
  return status;
}