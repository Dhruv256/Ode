import CreatorApp from "@/components/creator/CreatorApp";
import { ProjectProvider } from "@/state/projectStore";

export default function CreatePage() {
  return (
    <ProjectProvider>
      <CreatorApp />
    </ProjectProvider>
  );
}
