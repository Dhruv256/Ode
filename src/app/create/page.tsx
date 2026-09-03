import CreatorApp from "@/components/creator/CreatorApp";
import { ProjectProvider } from "@/state/projectStore";
import { localDraftOwner } from "@/lib/serverAuth";
export const dynamic = "force-dynamic";

export default async function CreatePage({ searchParams }: { searchParams: { project?: string; new?: string; preview?: string } }) {
  const ownerKey = await localDraftOwner();
  return (
    <ProjectProvider key={`${ownerKey}:${searchParams.project ?? searchParams.new ?? "resume"}`} ownerKey={ownerKey} projectId={searchParams.project} fresh={searchParams.new === "1"}>
      <CreatorApp preview={searchParams.preview === "1"} />
    </ProjectProvider>
  );
}
