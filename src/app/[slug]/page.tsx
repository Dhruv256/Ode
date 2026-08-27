import { PublishedWorld } from "@/components/published/PublishedWorld";
import { publishedProjectBySlug } from "@/lib/publishedProjects";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PublishedPage({ params }: { params: { slug: string } }) {
  const project = await publishedProjectBySlug(params.slug);
  if (!project) notFound();
  return <PublishedWorld project={project} />;
}
