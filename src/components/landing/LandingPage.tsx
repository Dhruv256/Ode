"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ClerkNav from "@/components/auth/ClerkNav";
import OdeLogo from "@/components/brand/OdeLogo";
import styles from "./LandingPage.module.css";

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",
    alt: "A close editorial portrait in warm daylight",
    className: "portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85",
    alt: "A candid portrait with a bright smile",
    className: "sun",
  },
  {
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85",
    alt: "A fashion portrait against a dark background",
    className: "night",
  },
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
    alt: "Friends sharing a joyful outdoor moment",
    className: "friends",
  },
] as const;

const steps = [
  ["01", "Add the person", "Photos, a name, and the few details that make the page theirs."],
  ["02", "Choose a point of view", "Cinema, archive, contact sheet, cover star — pick the world, not a layout."],
  ["03", "Give it to them", "A private link that opens straight into their exhibition."],
] as const;

const featuredTemplates = ["CONTACT SHEET", "CUT & PASTE", "CINEMA", "THE ARCHIVE"] as const;

export default function LandingPage() {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion
    ? undefined
    : { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } };

  return (
    <main className={styles.landing} id="top">
      <a className={styles.skip} href="#story">Skip to the story</a>

      <header className={styles.header}>
        <Link href="#top" className={styles.wordmark} aria-label="Ode home">
          <OdeLogo className={styles.brandMark} priority size={42} variant="primary" />
          <span>ODE</span>
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          <a href="#how">How it works</a>
          <a href="#templates">Templates</a>
          <ClerkNav />
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <motion.p className={styles.kicker} {...reveal}>BIRTHDAY WEBSITES / FOR ONE PERSON ONLY</motion.p>
        <motion.h1 id="hero-title" className={styles.heroTitle} {...reveal} transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.07 }}>
          MAKE THEM<br /><em>A WORLD.</em>
        </motion.h1>
        <motion.div className={styles.heroBottom} {...reveal} transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.14 }}>
          <p>A birthday page should look less like a template and more like evidence that somebody paid attention.</p>
          <Link href="/create" className={styles.underlinedCta}>BEGIN WITH THEIR PHOTOS <span aria-hidden="true">↓</span></Link>
        </motion.div>

        <div className={styles.heroGallery} aria-label="A collage of birthday world photography">
          {gallery.map((photo, index) => (
            <motion.figure
              key={photo.src}
              className={`${styles.heroPhoto} ${styles[photo.className]}`}
              initial={reduceMotion ? false : { opacity: 0, y: 28, rotate: index % 2 ? 2 : -2 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: index % 2 ? 1 : -1 }}
              transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={photo.src} alt={photo.alt} fetchPriority={index === 0 ? "high" : "auto"} />
              <figcaption>FRAME 0{index + 1} / THEIR WORLD</figcaption>
            </motion.figure>
          ))}
          <span className={styles.ageStamp} aria-hidden="true">25</span>
        </div>
      </section>

      <section className={styles.manifesto} id="story" aria-labelledby="manifesto-title">
        <motion.p className={styles.kicker} {...reveal}>NOT A BIRTHDAY CARD. AN EXHIBITION.</motion.p>
        <motion.h2 id="manifesto-title" {...reveal}>
          THEIR FACE.<br />THEIR FAVORITE<br /><em>CHAOS.</em>
        </motion.h2>
        <motion.p className={styles.manifestoNote} {...reveal}>Photos lead. The details arrive quietly: a line they always say, their era, the places that matter, a message that actually sounds like you.</motion.p>
      </section>

      <section className={styles.process} id="how" aria-labelledby="process-title">
        <div className={styles.sectionLead}>
          <p className={styles.kicker}>THREE MOVES. NO DESIGN DEGREE.</p>
          <h2 id="process-title">START WITH<br />THE <em>PERSON.</em></h2>
        </div>
        <ol className={styles.steps}>
          {steps.map(([number, title, detail]) => (
            <motion.li key={number} {...reveal}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className={styles.exhibit} id="templates" aria-labelledby="template-title">
        <div className={styles.exhibitTitle}>
          <p className={styles.kicker}>TWELVE WAYS TO FRAME A LIFE</p>
          <h2 id="template-title">NO TWO SHOULD<br />FEEL <em>ALIVE</em> THE SAME.</h2>
        </div>
        <div className={styles.templateTape} aria-label="Featured birthday website templates">
          {featuredTemplates.map((template, index) => (
            <motion.article
              key={template}
              className={`${styles.templateTicket} ${styles[`ticket${index + 1}`]}`}
              whileHover={reduceMotion ? undefined : { y: -10, rotate: index % 2 ? 1 : -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span>0{index + 1} / 12</span>
              <strong>{template}</strong>
              <small>{index === 0 ? "ANALOG / ARCHIVE" : index === 1 ? "SCRAPBOOK / EDITORIAL" : index === 2 ? "LIFE, IN SCENES" : "PERSONAL MUSEUM"}</small>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.closingPhoto}>
          <img src={gallery[3].src} alt="Friends laughing together outdoors" loading="lazy" />
          <span>THEIR FAVORITE PEOPLE / IN ONE PLACE</span>
        </div>
        <div className={styles.closingWords}>
          <p className={styles.kicker}>FOR THE ONES WORTH MAKING A FUSS ABOUT</p>
          <h2 id="closing-title">MAKE THE LINK<br />THEY <em>KEEP.</em></h2>
          <Link href="/create" className={styles.primaryCta}>START THEIR WORLD <span aria-hidden="true">↗</span></Link>
          <p className={styles.closingNote}>Build the first scene now. Add the rest as you remember it.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <OdeLogo className={styles.footerMark} size={34} variant="dark" />
          <span>ODE</span>
        </div>
        <span>MADE FOR PEOPLE WHO DESERVE A BIGGER BIRTHDAY.</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
