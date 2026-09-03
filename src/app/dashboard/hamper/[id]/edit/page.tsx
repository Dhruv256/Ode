import { BuilderLoader } from "@/features/hamper/builder/BuilderLoader";
export default function EditHamperPage({ params, searchParams }: { params: { id: string }; searchParams: { step?: string } }) { return <BuilderLoader id={params.id} step={Number(searchParams.step) || 0} />; }
