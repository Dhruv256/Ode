import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isCreatorRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/create(.*)",
  "/project(.*)",
  "/settings(.*)",
  "/api/media/sign(.*)",
  "/api/projects(.*)",
  "/api/websites(.*)",
  "/api/hampers(.*)",
]);

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkIsConfigured =
  process.env.NEXT_PUBLIC_CLERK_ENABLED !== "false" &&
  clerkPublishableKey?.startsWith("pk_") &&
  !clerkPublishableKey.includes("your_key");

const clerkProxy = clerkMiddleware(async (auth, request) => {
  if (isCreatorRoute(request)) {
    // API callers need JSON, not Clerk's not-found rewrite, which can match
    // the legacy public birthday /[slug] route in this application.
    if (request.nextUrl.pathname.startsWith("/api/")) {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Please sign in to your studio." }, { status: 401 });
      return;
    }
    await auth.protect();
  }
});

export default clerkIsConfigured
  ? clerkProxy
  : () => NextResponse.next();

export const config = {
  matcher: [
    // Public recipient pages must never enter Clerk's development handshake.
    "/", "/dashboard/:path*", "/create/:path*", "/settings/:path*", "/project/:path*",
    "/sign-in/:path*", "/sign-up/:path*",
    "/api/media/sign/:path*", "/api/projects/:path*", "/api/websites/:path*", "/api/hampers/:path*",
    "/__clerk/:path*",
  ],
};
