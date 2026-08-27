import CreatorApp from "@/components/creator/CreatorApp";
import { ProjectProvider } from "@/state/projectStore";

/**
 * The generator IS the product — no marketing landing page.
 * The app opens directly on “Who are we celebrating?”.
 */
export default function Home() {
  return (
    <ProjectProvider>
      <CreatorApp />
    </ProjectProvider>
  );
}
