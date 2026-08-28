"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import OdeLogo from "@/components/brand/OdeLogo";
import type { BirthdayProject } from "@/lib/types";
import styles from "./DashboardPage.module.css";

const STORAGE_KEY = "birthday-world/project/v1";

function savedProject(): BirthdayProject | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const project = JSON.parse(raw) as BirthdayProject;
    return project && typeof project === "object" && project.id ? project : null;
  } catch {
    return null;
  }
}

function projectName(project: BirthdayProject) {
  return project.person.nickname || project.person.fullName || "Untitled world";
}

function templateName(template?: string) {
  return template ? template.replace(/-/g, " ").toUpperCase() : "WORLD IN PROGRESS";
}

function projectDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function safePhoto(project: BirthdayProject) {
  const hero = project.photos.find((photo) => photo.isHero) ?? project.photos[0];
  if (!hero || hero.needsRelink || hero.previewUrl.startsWith("blob:")) return undefined;
  return hero.previewUrl;
}

export default function DashboardPage() {
  const [project, setProject] = useState<BirthdayProject | null>(null);
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setProject(savedProject());
    setReady(true);
  }, []);

  const name = project ? projectName(project) : "A new world";
  const photo = project ? safePhoto(project) : undefined;
  const isPublished = project?.publishing.status === "published";
  const publicUrl = project?.publishing.slug && isPublished ? `/${project.publishing.slug}` : undefined;
  const intro = project
    ? `The latest material for ${name} is here.`
    : "There is no active world on this device yet.";
  const motionProps = reduceMotion ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } };

  const beginFresh = () => {
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <main className={styles.dashboard}>
      <a className={styles.skip} href="#worlds">Skip to your worlds</a>
      <header className={styles.topbar}>
        <Link href="/" className={styles.wordmark} aria-label="Ode home">
          <OdeLogo className={styles.brandMark} size={38} variant="light" />
          <span>ODE</span>
        </Link>
        <nav aria-label="Creator navigation" className={styles.navigation}>
          <Link href="/dashboard" aria-current="page">STUDIO</Link>
          <Link href="/create">CREATE</Link>
          <Link href="/">SITE</Link>
        </nav>
        <span className={styles.identity} aria-label="Creator account">YOUR STUDIO</span>
      </header>

      <div className={styles.shell}>
        <aside className={styles.rail} aria-label="Studio sections">
          <p>PRIVATE<br />STUDIO</p>
          <span>01 / WORLDS</span>
          <span>02 / RELEASES</span>
          <span>03 / ACCOUNT</span>
          <small>LOCAL MODE<br />UNTIL SYNC</small>
        </aside>

        <section className={styles.content} id="worlds" aria-labelledby="studio-title">
          <motion.div className={styles.intro} {...motionProps}>
            <p className={styles.eyebrow}>THE WORKBENCH</p>
            <h1 id="studio-title">YOUR<br /><em>WORLDS.</em></h1>
            <p>{intro}</p>
          </motion.div>

          {!ready ? (
            <div className={styles.loading} aria-live="polite">OPENING THE STUDIO…</div>
          ) : project ? (
            <motion.article className={styles.activeWorld} {...motionProps} transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}>
              <div className={styles.worldVisual}>
                {photo ? (
                  <img src={photo} alt={`Preview of ${name}'s birthday world`} />
                ) : (
                  <div className={styles.placeholderVisual} aria-hidden="true">
                    <span>{project.age ?? "?"}</span>
                    <i>{name.slice(0, 1).toUpperCase()}</i>
                    <b>MEMORY<br />MATERIAL</b>
                  </div>
                )}
                <span className={styles.visualLabel}>{templateName(project.templateId)}</span>
              </div>

              <div className={styles.worldDetails}>
                <div className={styles.statusline}>
                  <span className={isPublished ? styles.published : styles.draft}>{isPublished ? "PUBLISHED" : "DRAFT"}</span>
                  <span>LAST TOUCHED {projectDate(project.updatedAt)}</span>
                </div>
                <h2>{name}</h2>
                <p className={styles.worldSummary}>{project.person.fullName ? `A birthday world for ${project.person.fullName}.` : "Give this world a name, then make it personal."}</p>
                <dl className={styles.materials}>
                  <div><dt>PHOTOS</dt><dd>{String(project.photos.length).padStart(2, "0")}</dd></div>
                  <div><dt>WORDS</dt><dd>{String(project.memories.filter((memory) => memory.answer.trim()).length).padStart(2, "0")}</dd></div>
                  <div><dt>STYLE</dt><dd>{project.templateId ? "SET" : "OPEN"}</dd></div>
                </dl>
                <div className={styles.actions}>
                  <Link href="/create" className={styles.continue}>CONTINUE MAKING <span aria-hidden="true">→</span></Link>
                  {publicUrl ? <Link href={publicUrl} className={styles.secondary}>OPEN RECIPIENT VIEW ↗</Link> : <span className={styles.secondaryMuted}>PUBLISH WHEN IT FEELS READY</span>}
                </div>
              </div>
            </motion.article>
          ) : (
            <motion.section className={styles.empty} {...motionProps} aria-labelledby="empty-title">
              <div className={styles.emptyArt} aria-hidden="true"><span>01</span><i>?</i><b>ONE<br />PERSON</b></div>
              <div>
                <p className={styles.eyebrow}>NO WORLDS YET</p>
                <h2 id="empty-title">START WITH<br />THE <em>ONE</em> THEY’LL KEEP.</h2>
                <p>You only need one good photo to begin. The rest can arrive as the story does.</p>
                <Link href="/create" className={styles.continue} onClick={beginFresh}>CREATE A WORLD <span aria-hidden="true">→</span></Link>
              </div>
            </motion.section>
          )}

          <section className={styles.ledger} aria-labelledby="ledger-title">
            <div>
              <p className={styles.eyebrow}>RELEASE LEDGER</p>
              <h2 id="ledger-title">KEEP THE<br /><em>GOOD</em> ONES.</h2>
            </div>
            <div className={styles.ledgerNote}>
              <p><strong>LOCAL MODE</strong> — your active draft is saved in this browser while we finish cloud sync.</p>
              <p>When Clerk and Supabase are activated, this studio becomes your account’s private archive and projects can be resumed from any device.</p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
