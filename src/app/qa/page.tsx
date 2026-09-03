import PublishedPage from "@/app/[slug]/page";
export const dynamic = "force-dynamic";
// The local QA subtree must not displace a pre-existing birthday slug.
export default function LegacyQaSlug() { return PublishedPage({ params: { slug: "qa" } }); }
