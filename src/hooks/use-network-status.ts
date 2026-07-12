import { useEffect, useState } from "react";
import { getNetStatus, onNetStatus, type NetStatus } from "@/lib/native/network-queue";

export function useNetworkStatus(): NetStatus {
  const [status, setStatus] = useState<NetStatus>(() => getNetStatus());
  useEffect(() => onNetStatus(setStatus), []);
  return status;
}