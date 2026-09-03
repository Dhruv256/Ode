"use client";
export default function HamperError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-lg px-6 py-24"><h1 className="font-display text-3xl">Your package needs a moment.</h1><p className="my-5">We couldn&apos;t open it right now. Please try again shortly.</p><button className="border border-line px-5 py-3" onClick={reset}>Try again</button></main>;
}
