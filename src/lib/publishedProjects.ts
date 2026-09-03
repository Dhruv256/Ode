import type { BirthdayProject } from "@/lib/types";
import { database } from "@/lib/database";

export async function publishedProjectBySlug(slug: string): Promise<BirthdayProject | null> {
  const sql = database();
  const rows = await sql<{ project: BirthdayProject }[]>`
    select project
    from public.birthday_projects
    where slug = ${slug}
      and status = 'published'
      and visibility <> 'private'
    limit 1
  `;
  return rows[0]?.project ?? null;
}

