import { NextResponse } from "next/server";
/** Deterministic hostile aspect-ratio fixture, with a clearly marked focal subject. */
export function GET(request: Request) {
  if (process.env.NODE_ENV === "production" || process.env.ODE_QA_MODE !== "true") return new Response(null,{status:404});
  const params = new URL(request.url).searchParams;
  const dims = [[1080,1920],[4032,3024],[1200,1200],[3000,600],[640,900],[160,120],[4000,6000]];
  const [w,h] = dims[Math.abs(Number(params.get("shape"))||0)%7];
  const n = Math.abs(Number(params.get("n"))||0)%75;
  const colors = ["#cba786","#b5c5b9","#9baebd","#d9b78d","#c7adb6","#d1c8aa","#97aea7"];
  return new NextResponse(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 1000 1000" preserveAspectRatio="none"><rect width="1000" height="1000" fill="${colors[n%7]}"/><path d="M0 700L350 400 660 660 1000 330V1000H0" fill="#344b45" opacity=".35"/><ellipse cx="500" cy="380" rx="${80*h/w}" ry="80" fill="#f2dcc4"/><path d="M360 770Q365 480 500 480Q635 480 640 770" fill="#455969"/><text x="40" y="90" font-family="monospace" font-size="36" fill="#202522">FRAME ${String(n+1).padStart(2,"0")} · ${w}×${h}</text><path d="M490 350h20m-10-10v20" stroke="#b34c30" stroke-width="3"/></svg>`,{headers:{"content-type":"image/svg+xml","cache-control":"public, max-age=3600"}});
}
