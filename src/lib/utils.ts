export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Human label for photo-count guidance. */
export function photoCountGuidance(count: number): string {
  if (count === 0) return "Start with a handful of favorites.";
  if (count < 8) return `${count} photo${count === 1 ? "" : "s"} — keep going, 8–12 feels intimate.`;
  if (count <= 12) return `${count} photos — intimate.`;
  if (count <= 29) return `${count} photos — ideal range.`;
  return `${count} photos — full archive mode.`;
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

export function normalizeHex(hex: string): string {
  const trimmed = hex.trim().replace(/^#/, "");
  if (trimmed.length === 3) {
    return `#${trimmed[0]}${trimmed[0]}${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}`.toUpperCase();
  }
  return `#${trimmed.toUpperCase()}`;
}
