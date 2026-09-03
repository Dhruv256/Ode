import DashboardPage from "@/components/dashboard/DashboardPage";
import { localDraftOwner } from "@/lib/serverAuth";
export const dynamic = "force-dynamic";
export default async function WebsitesPage() {
  const ownerKey = await localDraftOwner();
  return <DashboardPage key={ownerKey} section="websites" ownerKey={ownerKey} />;
}
