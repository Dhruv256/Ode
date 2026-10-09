import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AskOutExperience } from "@/features/askout/recipient/AskOutExperience";
import { publicAskOut } from "@/features/askout/server/repository";
import { RequestError } from "@/lib/serverAuth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "You have a suspicious message · Ode", description: "A tagged message intended for exactly one person.", robots: { index: false, follow: false, noarchive: true } };
export default async function AskOutPage({ params }: { params: { slug: string } }) {
  try { return <AskOutExperience content={await publicAskOut(params.slug)} />; }
  catch (error) { if (error instanceof RequestError && error.status === 404 || error instanceof Error && error.name === "ValidationError") notFound(); throw error; }
}
