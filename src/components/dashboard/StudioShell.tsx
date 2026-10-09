import Link from "next/link";
import OdeLogo from "@/components/brand/OdeLogo";
import type { ReactNode } from "react";
import styles from "@/features/hamper/hamper.module.css";
export function StudioShell({ children, section = "dashboard" }: { children: ReactNode; section?: "dashboard" | "websites" | "hamper" | "askouts" }) {
  return <div className={styles.studio}>
    <a href="#studio-content" className={styles.skip}>Skip to content</a>
    <header className={styles.topbar}>
      <Link href="/dashboard" className={styles.brand} aria-label="Ode dashboard"><OdeLogo variant="light" size={36} /><span>ODE</span></Link>
      <nav aria-label="Studio navigation">{([ ["dashboard", "/dashboard", "Dashboard"], ["websites", "/dashboard/websites", "Websites"], ["hamper", "/dashboard/hamper", "Hampers"], ["askouts", "/dashboard/askouts", "Ask Outs"] ] as const).map(([key, href, label]) => <Link key={key} href={href} aria-current={key === section ? "page" : undefined}>{label}</Link>)}</nav>
    </header>
    <main id="studio-content" className={styles.studioContent}>{children}</main>
  </div>;
}
