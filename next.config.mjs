import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" }] },
  async headers() {
    return [{source:'/:path*',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'X-Frame-Options',value:'DENY'},
      {key:'Content-Security-Policy',value:"frame-ancestors 'none'; base-uri 'self'; object-src 'none'"},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    ]}, { source: "/hamper/:path*", headers: [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Cache-Control", value: "private, no-store" },
    ] }, { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] }];
  },
};

export default (phase) => ({
  ...nextConfig,
  // A running dev worker must never share generated chunks or trace files
  // with a production build, including on Windows.
  distDir: phase === PHASE_DEVELOPMENT_SERVER
    ? (process.env.ODE_QA_MODE === "true" ? ".next-qa" : ".next-dev")
    : (process.env.ODE_ISOLATED_BUILD === "true" ? ".next-build" : ".next"),
});
