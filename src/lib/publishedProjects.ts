import type { BirthdayProject } from "@/lib/types";
import { database } from "@/lib/database";

export async function savePublishedProject(project: BirthdayProject, writeToken: string): Promise<boolean> {
  const slug = project.publishing.slug;
  if (!slug) throw new Error("A publishing slug is required.");

  const sql = database();
  const publicProject = {
    ...project,
    publishing: { ...project.publishing, publishToken: undefined },
  };
  const rows = await sql`
    insert into public.birthday_projects (slug, project, write_token, visibility, status, created_at, updated_at)
    values (
      ${slug},
      ${sql.json(JSON.parse(JSON.stringify(publicProject)))},
      ${writeToken},
      ${project.publishing.visibility},
      ${project.publishing.status},
      now(),
      now()
    )
    on conflict (slug) do update set
      project = excluded.project,
      visibility = excluded.visibility,
      status = excluded.status,
      updated_at = now()
    where birthday_projects.write_token = ${writeToken}
    returning slug
  `;
  return rows.length > 0;
}

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
