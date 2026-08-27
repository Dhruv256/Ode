"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight scroll reveal. Respects prefers-reduced-motion: when reduced,
 * elements render visible with no transition. Uses IntersectionObserver — no
 * animation library required, works across every generated template.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("transition-all duration-700 ease-out", !shown && "translate-y-[var(--tp-rv-y,16px)] opacity-0", className)}
      style={{ transitionDelay: `${delay}ms`, ["--tp-rv-y" as string]: `${y}px` }}
    >
      {children}
    </Tag>
  );
}