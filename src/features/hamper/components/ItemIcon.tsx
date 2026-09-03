import { HAMPER_ITEM_REGISTRY } from "../config";
import type { ItemType } from "../types";
export function ItemIcon({ type, size = 40 }: { type: ItemType; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={HAMPER_ITEM_REGISTRY[type].path} /></svg>;
}
