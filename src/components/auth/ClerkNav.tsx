"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function ClerkNav() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkEnabled =
    process.env.NEXT_PUBLIC_CLERK_ENABLED !== "false" &&
    clerkPublishableKey?.startsWith("pk_") &&
    !clerkPublishableKey.includes("your_key");

  if (!clerkEnabled) {
    return <Link href="/create" className="landing-clerk-trigger">START A WORLD <span aria-hidden="true">↗</span></Link>;
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="landing-clerk-trigger">SIGN IN <span aria-hidden="true">↗</span></button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard" className="landing-clerk-dashboard">MY STUDIO</Link>
        <span className="landing-clerk-user"><UserButton /></span>
      </SignedIn>
    </>
  );
}
