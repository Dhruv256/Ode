import { SignIn } from "@clerk/nextjs";
import styles from "@/components/auth/AuthPage.module.css";

export default function SignInPage() {
  return (
    <main className={styles.authPage}>
      <div className={styles.frame}>
        <p>BIRTHDAY WORLD<span>*</span></p>
        <h1>COME<br /><em>IN.</em></h1>
        <SignIn />
      </div>
    </main>
  );
}
