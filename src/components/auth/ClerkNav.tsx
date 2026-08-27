"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function ClerkNav() {
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
