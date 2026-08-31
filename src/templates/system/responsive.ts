"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 639px)";

/**
 * Behavioural breakpoint for recipient sites. CSS owns geometry; this hook is
 * only for interactions that genuinely need a different mobile edition (drag,
 * sticky motion, and spatial walls). It deliberately has a stable server
 * snapshot so publishing never hydrates with a different tree.
 */
export function useMobileComposition(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(MOBILE_QUERY);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
}

export type PerformanceTier = "low" | "medium" | "high";

/** Conservative capability hint used to reduce spatial density, never content. */
export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>("medium");
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memory = nav.deviceMemory ?? 4;
    const cores = nav.hardwareConcurrency ?? 4;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setTier(memory <= 2 || cores <= 2 ? "low" : memory >= 8 && cores >= 8 && !coarse ? "high" : "medium");
  }, []);
  return tier;
}
