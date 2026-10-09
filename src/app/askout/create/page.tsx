import StudioAuthProvider from "@/components/auth/StudioAuthProvider";
import { AskOutBuilder } from "@/features/askout/builder/AskOutBuilder";
export const dynamic = "force-dynamic";
export default function CreateAskOutPage() { return <StudioAuthProvider><AskOutBuilder /></StudioAuthProvider>; }
