"use client";

import { useSyncExternalStore } from "react";

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

