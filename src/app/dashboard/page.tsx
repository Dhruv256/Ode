import DashboardPage from "@/components/dashboard/DashboardPage";
import { localDraftOwner } from "@/lib/serverAuth";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const ownerKey = await localDraftOwner();
  return <DashboardPage key={ownerKey} ownerKey={ownerKey} />;
}
