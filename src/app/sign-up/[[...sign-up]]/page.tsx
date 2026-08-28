import { SignUp } from "@clerk/nextjs";
import OdeLogo from "@/components/brand/OdeLogo";
import styles from "@/components/auth/AuthPage.module.css";

export default function SignUpPage() {
  return (
    <main className={styles.authPage}>
      <div className={styles.frame}>
        <div className={styles.brand}>
          <OdeLogo size={44} variant="light" />
          <span>ODE</span>
        </div>
        <h1>MAKE<br /><em>ROOM.</em></h1>
        <SignUp />
      </div>
    </main>
  );
}
