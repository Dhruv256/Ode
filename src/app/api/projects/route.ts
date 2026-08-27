import { NextResponse } from "next/server";
import type { BirthdayProject } from "@/lib/types";
import { savePublishedProject } from "@/lib/publishedProjects";
import { validSlug } from "@/lib/publishing";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

function hasLocalOnlyMedia(project: BirthdayProject) {
  return project.photos.some((photo) => photo.previewUrl.startsWith("blob:"))
    || Boolean(project.soundtrack?.previewUrl.startsWith("blob:"));
}

export async function POST(request: Request) {
  try {
    const { project } = await request.json() as { project?: BirthdayProject };
    if (!project || !validSlug(project.publishing.slug ?? "")) {
      return NextResponse.json({ error: "A valid publishing slug is required." }, { status: 400 });
    }
    if (project.publishing.status !== "published") {
      return NextResponse.json({ error: "Only published worlds can be released." }, { status: 400 });
    }
    if (hasLocalOnlyMedia(project)) {
      return NextResponse.json({
        error: "Your photos are still local browser files. Add Supabase Storage credentials before publishing media to a deployed world.",
        code: "LOCAL_MEDIA",
      }, { status: 422 });
    }

    const writeToken = request.headers.get("x-birthday-project-token") || project.publishing.publishToken || randomUUID();
    const saved = await savePublishedProject(project, writeToken);
    if (!saved) {
      return NextResponse.json({ error: "This publishing slug belongs to another creator session." }, { status: 409 });
    }
    return NextResponse.json({ ok: true, writeToken });
  } catch (error) {
    console.error("Unable to publish birthday world", error);
    return NextResponse.json({ error: "The world could not be saved. Check the database configuration." }, { status: 500 });
  }
}
