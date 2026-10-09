"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ASK_OUT_INTERESTS, ASK_OUT_THEMES, compatibleInteractions, funnyDayOptions, weekdayFor } from "../config";
import { ASK_OUT_VOICE, suggestedCopy, type AskOutCopyIntent } from "../copy";
import { askOutApi, copyAskOutLink } from "../client";
import { AskOutExperience } from "../recipient/AskOutExperience";
import { EMPTY_ASK_OUT, type AskOut, type AskOutContent, type AskOutMiniGame } from "../types";
import styles from "../askout.module.css";

const STEPS = ["Person", "Interests", "Date details", "Experience", "Publish"];
const COPY_ACTIONS: Array<{ intent: AskOutCopyIntent; label: string }> = [
  { intent: "another", label: "Generate another" }, { intent: "funnier", label: "Make funnier" },
  { intent: "cuter", label: "Make cuter" }, { intent: "less-romantic", label: "Make less romantic" },
  { intent: "more-romantic", label: "Make more romantic" }, { intent: "drier", label: "Make drier" },
  { intent: "shorter", label: "Make shorter" },
];
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42);
const hasMeaningfulDraft = (content: AskOutContent) => Object.entries(content).some(([key, value]) => {
  const initial = EMPTY_ASK_OUT[key as keyof AskOutContent];
  if (typeof value === "string" && typeof initial === "string") return value.trim() !== initial.trim();
  return JSON.stringify(value) !== JSON.stringify(initial);
});

function Field({ label, value, onChange, required, type = "text", help, wide, multiline, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; help?: string; wide?: boolean; multiline?: boolean; placeholder?: string }) {
  const inputId = useId();
  return <div className={`${styles.field} ${wide ? styles.wide : ""}`}><label htmlFor={inputId}>{label}{required ? " *" : ""}</label>{multiline ? <textarea id={inputId} value={value} maxLength={600} placeholder={placeholder} onChange={e => onChange(e.target.value)} /> : <input id={inputId} value={value} type={type} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}{help && <small>{help}</small>}</div>;
}

export function AskOutBuilder() {
  const params = useSearchParams(), router = useRouter(), id = params.get("id");
  const [askOut, setAskOut] = useState<AskOut | null>(null), [content, setContent] = useState<AskOutContent>(EMPTY_ASK_OUT), [step, setStep] = useState(0), [previewScreen, setPreviewScreen] = useState(0), [busy, setBusy] = useState(false), [loadingExisting, setLoadingExisting] = useState(Boolean(id)), [notice, setNotice] = useState(""), [slug, setSlug] = useState(""), [copyVariant, setCopyVariant] = useState(0), [copySuggestion, setCopySuggestion] = useState(0);
  const interactionScreens = content.miniGames.length ? 1 + (content.miniGames.length > 1 ? 1 : 0) + (content.miniGames.length > 3 ? 1 : 0) : 0;
  const maxPreview = interactionScreens + 3 + (content.playfulJourney ? 1 : 0);
  const compatibleGames = compatibleInteractions(content.theme);
  useEffect(() => {
    if (!id) { setLoadingExisting(false); return; }
    let active = true;
    setLoadingExisting(true); setNotice("");
    void askOutApi<AskOut>(`/api/askouts/${id}`)
      .then(value => { if (active) { setAskOut(value); setContent(value); setSlug(value.slug); } })
      .catch(error => { if (active) setNotice(`The studio dropped a classified file. Reload this page. ${error.message}`); })
      .finally(() => { if (active) setLoadingExisting(false); });
    return () => { active = false; };
  }, [id]);
  const update = <K extends keyof AskOutContent>(key: K, value: AskOutContent[K]) => setContent(current => ({ ...current, [key]: value }));
  const sharePath = askOut ? `/askout/${askOut.slug}` : "";
  const canPublish = Boolean(content.recipientName && content.creatorName && content.date && content.pickupTime && content.destination && content.mapAddress && content.activity && content.dayOptions.length === 3);
  const canSaveDraft = Boolean(askOut || hasMeaningfulDraft(content));
  const dateHint = useMemo(() => content.date ? new Date(`${content.date}T12:00:00`).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }) : "", [content.date]);
  async function save(publish = false) {
    if (!publish && !canSaveDraft) return; setBusy(true); setNotice("");
    try {
      const creating = !askOut;
      const value = creating
        ? await askOutApi<AskOut>("/api/askouts", { method: "POST", body: JSON.stringify({ content, publish, slug: slug || undefined }) })
        : await askOutApi<AskOut>(`/api/askouts/${askOut.id}`, { method: "PUT", body: JSON.stringify({ content, updatedAt: askOut.updatedAt, publish, slug }) });
      setAskOut(value); setContent(value); setSlug(value.slug); setNotice(publish ? "Published. Your suspicious message is ready." : "Draft saved.");
      if (creating) router.replace(`/askout/create?id=${value.id}`, { scroll: false });
      if (publish) setStep(4);
    } catch (error) { const detail=error instanceof Error?error.message:"Save again.";setNotice(`${ASK_OUT_VOICE[content.theme].error} ${detail}`); } finally { setBusy(false); }
  }
  function dateChanged(value: string) {
    const weekday = weekdayFor(value); update("date", value);
    setContent(current => ({ ...current, date: value, weekday, dayOptions: funnyDayOptions(weekday, copyVariant, current.theme) }));
  }
  function toggleInterest(id: AskOutContent["interests"][number]) { update("interests", content.interests.includes(id) ? content.interests.filter(item => item !== id) : content.interests.length < 6 ? [...content.interests, id] : content.interests); }
  function toggleGame(id: AskOutMiniGame) { update("miniGames", content.miniGames.includes(id) ? content.miniGames.filter(game => game !== id) : content.miniGames.length < 5 ? [...content.miniGames, id] : content.miniGames); }
  function selectTheme(theme: AskOutContent["theme"]) { setPreviewScreen(0); setCopySuggestion(1); setContent(current => { const themed={...current,theme,miniGames:[...ASK_OUT_THEMES[theme].interactions],dayOptions:funnyDayOptions(current.weekday,copyVariant,theme)};return{...themed,...suggestedCopy(themed,"another",0)}; }); }
  function applyCopy(intent: AskOutCopyIntent) { setContent(current=>({...current,...suggestedCopy(current,intent,copySuggestion)}));if(intent==="another")setCopySuggestion(value=>value+1);setNotice("Copy refreshed. The tiny writers’ room has adjourned."); }
  function moveGame(index: number, direction: -1 | 1) { const games = [...content.miniGames], target = index + direction; if (target < 0 || target >= games.length) return; [games[index], games[target]] = [games[target], games[index]]; update("miniGames", games); }
  if (id && !askOut) return <main className={styles.builder}><div className={styles.editor}><p>Ask Out studio</p><h1>{loadingExisting ? "Opening the classified file…" : "This classified file could not be opened."}</h1>{notice && <div className={styles.notice}>{notice}</div>}</div></main>;
  return <main className={styles.builder}>
    <header className={styles.builderHeader}><Link href="/dashboard/askouts">← Studio</Link><strong>Ask Out for {content.recipientName || "someone"}</strong><span>{askOut?.status === "published" ? "Published" : askOut ? "Private draft" : "Not saved yet"}</span></header>
    <div className={styles.builderGrid}><section className={styles.editor}>
      <p>Ask Out · {String(step + 1).padStart(2, "0")}</p><h1>{STEPS[step]}</h1><div className={styles.editorIntro}>{step === 0 ? "Give the message a sender and exactly one intended recipient." : step === 1 ? "Pick a few useful details. They influence jokes and props, not the whole design." : step === 2 ? "You supply every real-world detail. Ode never invents logistics." : step === 3 ? "Choose one complete visual world and three to five intentional interactions." : "Check the exact recipient experience, then release the link."}</div>
      <nav className={styles.stepNav} aria-label="Creator steps">{STEPS.map((label, index) => <button key={label} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)}>{index + 1}. {label}</button>)}</nav>
      {notice && <p role="status" className={styles.notice}>{notice}</p>}
      {step === 0 && <div className={styles.formGrid}><Field label="Recipient name" required value={content.recipientName} onChange={value => update("recipientName", value)} placeholder="Anoli" /><Field label="Nickname / @tag" value={content.recipientTag} onChange={value => update("recipientTag", value)} placeholder="@anoli" /><Field label="Your name" required value={content.creatorName} onChange={value => update("creatorName", value)} placeholder="Dhruv" /><Field wide multiline label="Custom opening" value={content.openingMessage} onChange={value => update("openingMessage", value)} placeholder="Optional. Keep it short and suspicious." /></div>}
      {step === 1 && <div className={styles.formGrid}><div className={`${styles.field} ${styles.wide}`}><span className={styles.groupLabel}>Their interests · up to 6</span><div className={styles.chips}>{ASK_OUT_INTERESTS.map(interest => <button type="button" key={interest.id} className={styles.chip} aria-pressed={content.interests.includes(interest.id)} onClick={() => toggleInterest(interest.id)}>{interest.label}</button>)}</div></div><Field wide label="Custom interest" value={content.customInterest} onChange={value => update("customInterest", value)} placeholder="Ceramics, bad puns, Sunday markets…" /></div>}
      {step === 2 && <div className={styles.formGrid}>
        <Field label="Date" type="date" required value={content.date} onChange={dateChanged} help={dateHint || "Pick the actual date."} /><Field label="Day" required value={content.weekday} onChange={value => update("weekday", value)} help="Calculated from the date." />
        <Field label="Pickup time" type="time" required value={content.pickupTime} onChange={value => update("pickupTime", value)} /><Field label="Expected end" type="time" value={content.endTime} onChange={value => update("endTime", value)} />
        <Field label="Pickup location" value={content.pickupLocation} onChange={value => update("pickupLocation", value)} placeholder="Optional if meeting there" /><Field label="Meeting point" value={content.meetingPoint} onChange={value => update("meetingPoint", value)} placeholder="Instead of pickup" />
        <Field label="Destination / date location" required value={content.destination} onChange={value => update("destination", value)} placeholder="The Reading Room" /><Field label="Map address" required value={content.mapAddress} onChange={value => update("mapAddress", value)} placeholder="Searchable street address" help="Used verbatim for Open in Maps." />
        <Field wide label="Activity / plan" required value={content.activity} onChange={value => update("activity", value)} placeholder="Bookstore + coffee" /><Field label="Dress-code joke" value={content.dressCodeJoke} onChange={value => update("dressCodeJoke", value)} /><Field label="Reservation info" value={content.reservationInfo} onChange={value => update("reservationInfo", value)} />
        <Field wide multiline label="Special note" value={content.specialNote} onChange={value => update("specialNote", value)} />
        <Field wide label="Extra cute line" value={content.extraCuteLine} onChange={value => update("extraCuteLine", value)} placeholder="The cat can finally clock out." help="A small final line after acceptance. Optional, never shown as pressure." />
        <div className={`${styles.field} ${styles.wide}`}><span className={styles.groupLabel}>Funny day options</span><Field label="Question" value={content.dayQuestion} onChange={value => update("dayQuestion", value)} /><div className={styles.dayOptions}>{content.dayOptions.map((option, index) => <label key={option.id} className={styles.dayOption}><span>0{index + 1}</span><input value={option.label} onChange={e => update("dayOptions", content.dayOptions.map(item => item.id === option.id ? { ...item, label: e.target.value } : item))} /></label>)}</div><button className={styles.chip} type="button" onClick={() => { const nextVariant = copyVariant + 1; setCopyVariant(nextVariant); update("dayOptions", funnyDayOptions(content.weekday, nextVariant,content.theme)); }}>Regenerate options</button></div>
        <Field wide label="Time question" value={content.timeQuestion} onChange={value => update("timeQuestion", value)} />
      </div>}
      {step === 3 && <div className={styles.formGrid}><div className={`${styles.field} ${styles.wide}`}><span className={styles.groupLabel}>Choose one complete world</span><div className={styles.themeGrid}>{Object.entries(ASK_OUT_THEMES).map(([id, theme]) => <button type="button" key={id} className={styles.theme} aria-pressed={content.theme === id} onClick={() => selectTheme(id as AskOutContent["theme"])}><Image src={theme.asset} alt="" width={900} height={900} sizes="180px" /><span><b>{theme.vibe}</b><strong>{theme.name}</strong><small>{theme.description}</small><em>{theme.cuteness} · {theme.tone}</em><span className={styles.themeFlow}>{theme.exampleFlow}</span><span className={styles.themeRecommended}>Best for: {theme.recommended}</span></span></button>)}</div></div><label className={`${styles.playfulSetting} ${styles.wide}`}><input type="checkbox" checked={content.playfulJourney} onChange={e=>update("playfulJourney",e.target.checked)} /><span><strong>Playful Yes-Only Journey</strong><small>Turn this on to replace early “No” choices with funny evasive, looping, or mischievous interactions. The final date question will still allow a real Yes or No.</small>{content.playfulJourney&&<span className={styles.intensity}><b>Interaction intensity</b>{(["light","mischievous","chaotic"] as const).map(level=><label key={level}><input type="radio" name="playful-intensity" checked={content.playfulIntensity===level} onChange={()=>update("playfulIntensity",level)} />{level[0].toUpperCase()+level.slice(1)}</label>)}</span>}</span></label><div className={`${styles.field} ${styles.wide}`}><span className={styles.groupLabel}>Curated interactions · choose up to 5</span><small>Each theme starts with its recommended set. Switch off or reorder only compatible blocks.</small><div className={styles.gameList}>{compatibleGames.map(game => { const gameIndex = content.miniGames.indexOf(game.id); return <label key={game.id} className={styles.gameChoice}><input type="checkbox" checked={gameIndex >= 0} onChange={() => toggleGame(game.id)} /><span><strong>{game.name}</strong><small>{game.description}</small></span>{gameIndex >= 0 && <span className={styles.reorder}><button type="button" aria-label={`Move ${game.name} earlier`} onClick={e => { e.preventDefault(); moveGame(gameIndex, -1); }}>↑</button><button type="button" aria-label={`Move ${game.name} later`} onClick={e => { e.preventDefault(); moveGame(gameIndex, 1); }}>↓</button></span>}</label>; })}</div></div><div className={`${styles.field} ${styles.wide}`}><span className={styles.groupLabel}>Tiny writers’ room</span><small>Optional hand-written overrides. Suggestions use this theme’s voice and your real names.</small><div className={styles.copyTools}>{COPY_ACTIONS.map(action=><button type="button" key={action.intent} onClick={()=>applyCopy(action.intent)}>{action.label}</button>)}</div></div><Field wide multiline label="Opening line" value={content.openingMessage} onChange={value=>update("openingMessage",value)} /><Field wide label="Recurring joke" value={content.recurringJoke} onChange={value=>update("recurringJoke",value)} /><Field wide multiline label="Final invitation line" value={content.finalInvitationLine} onChange={value=>update("finalInvitationLine",value)} /><Field label="Accepted message" value={content.acceptedMessage} onChange={value=>update("acceptedMessage",value)} /><Field label="Decline message" value={content.declineMessage} onChange={value=>update("declineMessage",value)} /><Field wide multiline label="Tell me more details" value={content.additionalDetails} onChange={value => update("additionalDetails", value)} help="Reassurance, transport, duration, or context shown only when requested." /></div>}
      {step === 4 && <div className={styles.formGrid}><Field wide label="Share-link slug" value={slug} onChange={setSlug} help={`ode.xyz/askout/${slug || "your-link"}`} />{askOut?.status !== "published" ? <button disabled={!canPublish || busy} className={`${styles.publishButton} ${styles.wide}`} onClick={() => void save(true)}>Publish Ask Out</button> : <div className={`${styles.shareBox} ${styles.wide}`}><strong>Your Ask Out is ready.</strong><code>{sharePath}</code><div className={styles.shareActions}><button onClick={() => void copyAskOutLink(sharePath).then(setNotice)}>Copy link</button><a target="_blank" href={sharePath}>Preview</a><a target="_blank" href={`https://wa.me/?text=${encodeURIComponent(`You have a suspicious message: ${typeof location === "undefined" ? sharePath : new URL(sharePath, location.origin).href}`)}`}>WhatsApp share</a></div></div>}</div>}
      <footer className={styles.editorFooter}><button disabled={step === 0 || busy} onClick={() => setStep(value => value - 1)}>Previous</button><button disabled={busy || !canSaveDraft} onClick={() => void save(false)}>Save draft</button>{step < 4 && <button className={styles.nextButton} disabled={busy} onClick={() => { if (step === 0 && content.recipientName && !slug.startsWith(slugify(content.recipientName))) { const suffix = askOut?.id.slice(0, 4) || crypto.randomUUID().slice(0, 4); setSlug(`${slugify(content.recipientName)}-${suffix}`); } setStep(value => value + 1); }}>Next</button>}</footer>
    </section><aside className={styles.previewPane}>{content.playfulJourney&&<span className={styles.previewBanner}>Playful journey mode enabled · {content.playfulIntensity}</span>}<div className={styles.previewControls}><button aria-label="Previous preview screen" onClick={() => setPreviewScreen(value => Math.max(0, value - 1))}>←</button><button aria-label="Next preview screen" onClick={() => setPreviewScreen(value => Math.min(maxPreview, value + 1))}>→</button></div><div className={styles.phone}><AskOutExperience content={{ ...content, slug: askOut?.slug || slug || "preview" }} preview forcedScreen={previewScreen} /></div></aside></div>
  </main>;
}
