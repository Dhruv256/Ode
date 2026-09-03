/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Verify production while a Windows dev server holds .next/trace open.
  distDir: process.env.ODE_ISOLATED_BUILD === "true" ? ".next-build" : ".next",
  async headers() {
    return [{ source: "/hamper/:path*", headers: [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Cache-Control", value: "private, no-store" },
    ] }, { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] }];
  },
};

export default nextConfig;
