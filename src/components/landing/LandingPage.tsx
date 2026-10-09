"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ClerkNav from "@/components/auth/ClerkNav";
import OdeLogo from "@/components/brand/OdeLogo";
import { ItemObject } from '@/features/hamper/components/ItemObject';
import { ALL_TEMPLATES } from '@/lib/templates';
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
  ["03", "Give it to them", "A share link that opens straight into their exhibition."],
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
          <OdeLogo className={styles.brandMark} priority size={42} variant="primary" decorative />
          <span>ODE</span>
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          <a href="#how">How it works</a>
          <a href="#templates">Templates</a>
          <a href="#hampers">Digital Hampers</a>
          <ClerkNav />
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <p className={styles.kicker}>BIRTHDAY WEBSITES / FOR ONE PERSON ONLY</p>
        <h1 id="hero-title" className={styles.heroTitle}>
          MAKE THEM<br /><em>A WORLD.</em>
        </h1>
        <div className={styles.heroBottom}>
          <p>A birthday page should look less like a template and more like evidence that somebody paid attention.</p>
          <Link href="/create" prefetch={false} className={styles.underlinedCta}>BEGIN WITH THEIR PHOTOS <span aria-hidden="true">↓</span></Link>
        </div>

        <div className={styles.heroGallery} aria-label="A collage of birthday world photography">
          {gallery.map((photo, index) => (
            <motion.figure
              key={photo.src}
              className={`${styles.heroPhoto} ${styles[photo.className]}`}
              initial={false}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: index % 2 ? 1 : -1 }}
              transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={photo.src.replace('w=1000','w=640')} srcSet={`${photo.src.replace('w=1000','w=320')} 320w, ${photo.src.replace('w=1000','w=640')} 640w`} sizes="(max-width:760px) 42vw, 22vw" alt={photo.className==='friends' ? 'A sunlit landscape, a place worth remembering' : photo.alt} width={640} height={800} decoding="async" fetchPriority={index === 0 ? "high" : "auto"} />
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
          <p className={styles.kicker}>{ALL_TEMPLATES.length} WAYS TO FRAME A LIFE</p>
          <h2 id="template-title">NO TWO SHOULD<br />FEEL <em>ALIVE</em> THE SAME.</h2>
        </div>
        <div className={styles.templateTape} aria-label="Featured birthday website templates">
          {featuredTemplates.map((template, index) => (
            <motion.a
              key={template}
              href="/create"
              className={`${styles.templateTicket} ${styles[`ticket${index + 1}`]}`}
              whileHover={reduceMotion ? undefined : { y: -10, rotate: index % 2 ? 1 : -1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span>0{index + 1} / {ALL_TEMPLATES.length}</span>
              <strong>{template}</strong>
              <small>{index === 0 ? "ANALOG / ARCHIVE" : index === 1 ? "SCRAPBOOK / EDITORIAL" : index === 2 ? "LIFE, IN SCENES" : "PERSONAL MUSEUM"}</small>
            </motion.a>
          ))}
        </div>
      </section>

      <section className={styles.hampers} id="hampers" aria-labelledby="hamper-title">
        <motion.div className={styles.hamperWords} {...reveal}>
          <p className={styles.kicker}>DIGITAL HAMPERS / COLLECTED JUST FOR THEM</p>
          <h2 id="hamper-title">A little bit of<br /><em>everything<br />they love.</em></h2>
          <p>A letter. That song. A photograph they forgot you kept. Gather notes, photos, voice recordings, drawings and thoughtful links into one hamper, ready to unwrap.</p>
          <p className={styles.hamperDetail}>A birthday world tells their story. A Digital Hamper gives them a collection of little surprises to open, one by one.</p>
          <Link href="/dashboard/hamper/new" prefetch={false} className={styles.primaryCta}>CREATE A DIGITAL HAMPER <span aria-hidden="true">↗</span></Link>
        </motion.div>
        <motion.div className={styles.hamperStage} {...reveal} role="img" aria-label="A sample Digital Hamper containing a letter, photo prints, a cassette and a wrapped gift">
          <span className={styles.parcelTag}>TO: YOUR FAVOURITE PERSON<br />PACKED WITH: A LOT OF FEELING</span>
          <div className={styles.hamperObjects}>
            <figure><ItemObject type="note" variant="folded-letter" /><figcaption>A FEW WORDS</figcaption></figure>
            <figure><ItemObject type="photo" variant="polaroids" /><figcaption>THAT ONE DAY</figcaption></figure>
            <figure><ItemObject type="song" variant="cassette" /><figcaption>OUR SONG</figcaption></figure>
            <figure><ItemObject type="gift" variant="wrapped-box" /><figcaption>A LITTLE SURPRISE</figcaption></figure>
          </div>
          <span className={styles.parcelSeal} aria-hidden="true">WITH<br />LOVE</span>
          <p className={styles.parcelFootnote}>A COLLECTION THEY CAN KEEP COMING BACK TO.</p>
        </motion.div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.closingPhoto}>
          <img src={gallery[3].src} alt="A sunlit landscape, a place worth remembering" loading="lazy" decoding="async" width={1000} height={1200} />
          <span>THEIR FAVORITE PEOPLE / IN ONE PLACE</span>
        </div>
        <div className={styles.closingWords}>
          <p className={styles.kicker}>FOR THE ONES WORTH MAKING A FUSS ABOUT</p>
          <h2 id="closing-title">MAKE THE LINK<br />THEY <em>KEEP.</em></h2>
          <Link href="/create" prefetch={false} className={styles.primaryCta}>START THEIR WORLD <span aria-hidden="true">↗</span></Link>
          <p className={styles.closingNote}>Build the first scene now. Add the rest as you remember it.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <OdeLogo className={styles.footerMark} size={34} variant="dark" decorative />
          <span>ODE</span>
        </div>
        <span>MADE FOR PEOPLE WHO DESERVE A BIGGER BIRTHDAY.</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
