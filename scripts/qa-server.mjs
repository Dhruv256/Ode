import { spawn } from "node:child_process";
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "3100"], { stdio: "inherit", env: { ...process.env, ODE_QA_MODE: "true", NEXT_PUBLIC_CLERK_ENABLED: "false" }, windowsHide: true });
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => {
  if (process.platform === "win32" && child.pid) {
    // next dev owns a worker process. Close our whole child tree on Windows so
    // Playwright teardown does not leave the dev worker holding its output pipe.
    const stop = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    stop.on("exit", () => process.exit(0));
  } else child.kill();
});
child.on("exit", code => process.exit(code ?? 0));
