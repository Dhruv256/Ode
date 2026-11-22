import { notFound } from "next/navigation";
import { TemplateView } from "@/templates";
import { templateFixture } from "@/lib/templateFixture";
import { TEMPLATES } from "@/lib/templates";
import type { TemplateId } from "@/lib/types";

export default function TemplateQa({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  if (process.env.NODE_ENV === "production" || process.env.ODE_QA_MODE !== "true") notFound();
  const id = searchParams.template ?? "contact-sheet";
  if (!Object.hasOwn(TEMPLATES, id)) notFound();
  const project = templateFixture(id as TemplateId, Number(searchParams.photos ?? 12), searchParams.case, searchParams.vibe);
  if (searchParams.final === "hero") project.finalPhotoId = project.photos[0]?.id;
  return <TemplateView project={project} templateId={id as TemplateId} device="auto" />;
}
