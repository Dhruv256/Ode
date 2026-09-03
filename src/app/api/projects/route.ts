import { NextResponse } from "next/server";
import type { BirthdayProject } from "@/lib/types";
import { saveWebsite, validateWebsite } from "@/lib/websiteProjects";
import { requireOwner, readJson, requestError } from "@/lib/serverAuth";
import { validSlug } from "@/lib/publishing";

export const runtime = "nodejs";

function hasLocalOnlyMedia(project: BirthdayProject) {
  return project.photos.some((photo) => photo.previewUrl.startsWith("blob:"))
    || Boolean(project.soundtrack?.previewUrl.startsWith("blob:"));
}

export async function POST(request: Request) {
  try {
    const owner = await requireOwner();
    const body = await readJson(request, 2 * 1024 * 1024) as { project?: unknown };
    const project = validateWebsite(body.project);
    if (!project || !validSlug(project.publishing.slug ?? "")) {
      return NextResponse.json({ error: "A valid publishing slug is required." }, { status: 400 });
    }
    if (project.publishing.status !== "published") {
      return NextResponse.json({ error: "Only published worlds can be released." }, { status: 400 });
    }
    if (hasLocalOnlyMedia(project)) {
      return NextResponse.json({
        error: "Some photos have not finished uploading. Please try publishing again.",
        code: "LOCAL_MEDIA",
      }, { status: 422 });
    }

    await saveWebsite(owner, project, request.headers.get("x-birthday-project-token") || project.publishing.publishToken);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return requestError(error);
  }
}

