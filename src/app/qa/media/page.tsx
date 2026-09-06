import { notFound } from "next/navigation";
import MediaQa from "./surface";
export default function Page() {
  if (process.env.NODE_ENV === "production" || process.env.ODE_QA_MODE !== "true") notFound();
  return <MediaQa />;
}
