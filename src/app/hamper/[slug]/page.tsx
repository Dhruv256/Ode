import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { activeLink } from "@/features/hamper/server/public";
import { canAccess } from "@/features/hamper/server/security";
import { PublicHamper } from "@/features/hamper/recipient/PublicHamper";
import { RequestError } from "@/lib/serverAuth";
import { ValidationError } from "@/features/hamper/validation";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "A little package for you · Ode", description: "A few good things, chosen just for you.", robots: { index: false, follow: false, noarchive: true } };
export default async function HamperPage({ params }: { params: { slug: string } }) {
  try {
    const row = await activeLink(params.slug);
    return <PublicHamper slug={params.slug} locked={Boolean(row.pin_hash) && !canAccess(row.link_id, row.access_version)} />;
  } catch (error) {
    if (error instanceof RequestError && error.status === 404 || error instanceof ValidationError) notFound();
    throw error;
  }
}
