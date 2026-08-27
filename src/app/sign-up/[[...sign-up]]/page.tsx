import { SignUp } from "@clerk/nextjs";
import styles from "@/components/auth/AuthPage.module.css";

export default function SignUpPage() {
  return (
    <main className={styles.authPage}>
      <div className={styles.frame}>
        <p>BIRTHDAY WORLD<span>*</span></p>
        <h1>MAKE<br /><em>ROOM.</em></h1>
        <SignUp />
      </div>
    </main>
  );
}
