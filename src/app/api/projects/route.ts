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
        error: "Some photos have not finished uploading. Please try publishing again.",
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
    const databaseError = error as { code?: string; message?: string };
    let message = "The world could not be saved. Check the database connection in Vercel.";
    if (databaseError.message?.includes("DATABASE_URL is not configured")) {
      message = "DATABASE_URL is missing. Add Supabase's Session Pooler connection string to Vercel, then redeploy.";
    } else if (databaseError.code === "42P01") {
      message = "The birthday_projects table is missing. Run database/migrations/001_published_birthday_projects.sql in Supabase SQL Editor.";
    } else if (["ENOTFOUND", "ECONNREFUSED", "28P01", "3D000"].includes(databaseError.code ?? "")) {
      message = "Vercel could not connect to Supabase PostgreSQL. Use the Session Pooler DATABASE_URL from Supabase Connect and save it as a Vercel Secret.";
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
