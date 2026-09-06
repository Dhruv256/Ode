import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

/** Mounted only by creator/auth surfaces. Recipient trees contain no Clerk client. */
export default function StudioAuthProvider({ children }: { children: ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const enabled = process.env.NEXT_PUBLIC_CLERK_ENABLED !== "false" && key?.startsWith("pk_") && !key.includes("your_key");
  return enabled ? <ClerkProvider>{children}</ClerkProvider> : <>{children}</>;
}
