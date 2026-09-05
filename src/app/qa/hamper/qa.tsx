"use client";
import { useState } from "react";
import { Recipient } from "@/features/hamper/recipient/Recipient";
import { HamperBuilder } from "@/features/hamper/builder/HamperBuilder";
import { HAMPER_THEMES } from "@/features/hamper/config";
import type { HamperTheme } from "@/features/hamper/types";
import { fixtureHamper, fixtureItem } from "../../../../tests/fixtures";
import type { ItemType } from "@/features/hamper/types";
const heavyCounts: Record<ItemType, number> = { note:6, photo:5, song:3, video:4, voice:3, drawing:5, gift:4, location:5, coupon:5, news:6 };
function repeatedItems(counts: Partial<Record<ItemType, number>>) { let position = 0; return Object.entries(counts).flatMap(([type, count]) => Array.from({ length: count || 0 }, () => fixtureItem(type as ItemType, position++))); }
export function HamperQa({ mode, opening, theme, qaCase }: { mode?: string; opening?: string; theme?: string; qaCase?: string }) {
  const [fixture] = useState(() => { const h = fixtureHamper(); if (qaCase === "46") h.items = repeatedItems(heavyCounts); if (qaCase === "10-notes") h.items = repeatedItems({ note:10 }); if (opening === "scene") h.openingStyle = "scene"; if (theme && Object.hasOwn(HAMPER_THEMES, theme)) h.theme = theme as HamperTheme; return h; });
  if (mode === "builder") return <HamperBuilder initial={{ ...fixture, items: [] }} />;
  return <Recipient content={fixture} resolveAsset={async item => item.type === "photo" ? "/brand/ode-primary.png" : "/qa/hamper/audio"} />;
}
