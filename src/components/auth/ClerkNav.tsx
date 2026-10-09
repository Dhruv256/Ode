"use client";

import Link from "next/link";

export default function ClerkNav() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkEnabled =
    process.env.NEXT_PUBLIC_CLERK_ENABLED !== "false" &&
    clerkPublishableKey?.startsWith("pk_") &&
    !clerkPublishableKey.includes("your_key");

  if (!clerkEnabled) {
    return <Link href="/create" prefetch={false} className="landing-clerk-trigger">START A WORLD <span aria-hidden="true">↗</span></Link>;
  }

  // The public exhibition does not need a session handshake. Clerk loads at
  // the existing auth/creator boundary when the visitor enters their studio.
  return <span className="landing-studio-links">
    <Link href="/dashboard" prefetch={false} className="landing-clerk-dashboard">MY STUDIO</Link>
    <Link href="/sign-in" prefetch={false} className="landing-clerk-trigger">SIGN IN <span aria-hidden="true">↗</span></Link>
  </span>;
}
