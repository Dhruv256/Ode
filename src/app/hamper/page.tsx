import PublishedPage from "@/app/[slug]/page";
export const dynamic = "force-dynamic";
// Preserve a legacy birthday URL at /hamper if one existed before this format.
export default function LegacyHamperSlug() { return PublishedPage({ params: { slug: "hamper" } }); }
