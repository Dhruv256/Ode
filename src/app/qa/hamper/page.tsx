import { notFound } from "next/navigation";
import { HamperQa } from "./qa";
/** Explicit local test surface, excluded from production by a server check.
 * It contains invented fixtures and never changes auth or database access. */
export default function QaHamperPage({ searchParams }: { searchParams: { mode?: string; style?: string; theme?: string } }) {
  if (process.env.NODE_ENV === "production" || process.env.ODE_QA_MODE !== "true") notFound();
  return <HamperQa mode={searchParams.mode} opening={searchParams.style} theme={searchParams.theme} />;
}
