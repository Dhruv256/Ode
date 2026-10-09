import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { CREATOR_ROUTE_PATTERNS } from "../src/lib/creatorRoutes";

describe("creator route protection", () => {
  it("runs Clerk middleware for the Ask Out editor and owner API only", () => {
    expect(CREATOR_ROUTE_PATTERNS).toContain("/askout/create(.*)");
    expect(CREATOR_ROUTE_PATTERNS).toContain("/api/askouts(.*)");
    const middleware = readFileSync("src/middleware.ts", "utf8");
    expect(middleware).toContain('"/askout/create/:path*"');
    expect(middleware).toContain('"/api/askouts/:path*"');
    expect(middleware).not.toContain('"/askout/:path*"');
    expect(middleware).not.toContain('"/api/askout/:path*"');
  });
});
