"use client";
import { useState } from "react";
import { Recipient } from "@/features/hamper/recipient/Recipient";
import { HamperBuilder } from "@/features/hamper/builder/HamperBuilder";
import { HAMPER_THEMES } from "@/features/hamper/config";
import type { HamperTheme } from "@/features/hamper/types";
import { fixtureHamper } from "../../../../tests/fixtures";
export function HamperQa({ mode, opening, theme }: { mode?: string; opening?: string; theme?: string }) {
  const [fixture] = useState(() => { const h = fixtureHamper(); if (opening === "scene") h.openingStyle = "scene"; if (theme && Object.hasOwn(HAMPER_THEMES, theme)) h.theme = theme as HamperTheme; return h; });
  if (mode === "builder") return <HamperBuilder initial={{ ...fixture, items: [] }} />;
  return <Recipient content={fixture} resolveAsset={async item => item.type === "photo" ? "/brand/ode-primary.png" : "/qa/hamper/audio"} />;
}
