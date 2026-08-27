import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isCreatorRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/create(.*)",
  "/project(.*)",
  "/api/media/sign(.*)",
  "/api/projects(.*)",
]);

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkIsConfigured =
  clerkPublishableKey?.startsWith("pk_") &&
  !clerkPublishableKey.includes("your_key");

const clerkProxy = clerkMiddleware(async (auth, request) => {
  if (isCreatorRoute(request)) {
    await auth.protect();
  }
});

export default clerkIsConfigured
  ? clerkProxy
  : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
