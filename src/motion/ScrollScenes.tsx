"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMobileComposition } from "@/templates/system/responsive";

/**
 * A small motion vocabulary shared by recipient templates. These components
 * never intercept scrolling: normal document flow remains the source of truth
 * and reduced-motion users receive the finished composition immediately.
 */
export function ScrollZoom({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useMobileComposition();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 0.65, 1], reduced || mobile ? [1, 1.01, 1.06] : [0.7, 1.04, 1.34]);
  const y = useTransform(scrollYProgress, [0, 1], reduced || mobile ? ["0%", "0%"] : ["8%", "-8%"]);
  const radius = useTransform(scrollYProgress, [0, 0.8], reduced ? [28, 28] : [28, 0]);
  return <section ref={ref} className={`relative h-[118svh] sm:h-[145vh] ${className ?? ""}`}>
    <div className="sticky top-0 h-[100svh] overflow-hidden sm:h-screen">
      <motion.div style={{ scale, y, borderRadius: radius }} className="h-full origin-center overflow-hidden will-change-transform">{children}</motion.div>
    </div>
  </section>;
}

export function Parallax({ children, depth = 0.35, className }: { children: React.ReactNode; depth?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [70 * depth, -70 * depth]);
  return <motion.div ref={ref} className={className} style={{ y }}>{children}</motion.div>;
}
