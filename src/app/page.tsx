import LandingPage from "@/components/landing/LandingPage";
import StudioAuthProvider from "@/components/auth/StudioAuthProvider";

export default function Home() {
  return <StudioAuthProvider><LandingPage /></StudioAuthProvider>;
}
