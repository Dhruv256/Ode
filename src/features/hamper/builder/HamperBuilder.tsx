"use client";
import { useCallback, useEffect, useState } from "react";
import { StudioShell } from "@/components/dashboard/StudioShell";
import type { Hamper, HamperContent, HamperItem, HamperTheme, ItemType } from "../types";
import { api, shareLink } from "../client";
import { HAMPER_MESSAGE_FIELD, HAMPER_ITEM_REGISTRY, HAMPER_LIMITS, HAMPER_THEMES, ITEM_TYPES } from "../config";
import { validateContent, validateSlug, suggestSlug } from "../validation";
import { ItemIcon } from "../components/ItemIcon";
import { ItemObject } from "../components/ItemObject";
import { ItemEditor } from "./ItemEditor";
import { ArrangeItems } from "./ArrangeItems";
import { Recipient } from "../recipient/Recipient";
import { ManageHamper } from "./ManageHamper";
import styles from "../hamper.module.css";
const steps = ["For someone", "Wrapping", "Opening", "Fill it", "Arrange", "Preview", "Send"];
const titles = ["Who is this for?", "Choose the wrapping", "Choose how it opens", "Things to tuck inside", "A place for every little thing", "Take a little peek", "Wrap it up"];
export function HamperBuilder({ initial, initialStep = 0 }: { initial: Hamper; initialStep?: number }) {
  const [hamper, setHamper] = useState(initial), [content, setContent] = useState<HamperContent>(initial), [step, setStep] = useState(Math.min(6, Math.max(0, initialStep))), [slug, setSlug] = useState(initial.links.find(l => l.is_primary && !l.revoked_at)?.slug || suggestSlug(initial.recipient));
  const [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [editor, setEditor] = useState<{ type: ItemType; item?: HamperItem } | null>(null), [mobile, setMobile] = useState(false), [replay, setReplay] = useState(0);
  const [pinMode, setPinMode] = useState<"keep" | "set" | "remove">("keep"), [pin, setPin] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState<ItemType | null>(null);
  const [automaticSlug, setAutomaticSlug] = useState(!initial.recipient && initial.status === "draft");
  const [slugSuffix] = useState(() => crypto.randomUUID().slice(0, 6));
  const totalAssetLimitMb = HAMPER_LIMITS.maxTotalAssetBytesPerHamper / 1024 / 1024;
  const patch = (value: Partial<HamperContent>) => { setContent(c => ({ ...c, ...value })); setDirty(true); };
  useEffect(() => {
    function guard(e: BeforeUnloadEvent) { if (dirty) { e.preventDefault(); e.returnValue = ""; } }
    window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  const resolveAsset = useCallback(async (item: HamperItem) => item.assetUrl || (await api<{ url: string }>(`/api/hampers/${initial.id}/assets?item=${item.id}`)).url, [initial.id]);
  function accept(saved: Hamper) { setHamper(saved); setContent(saved); setSlug(saved.links.find(l => l.is_primary && !l.revoked_at)?.slug || ""); setDirty(false); setPinMode("keep"); setPin(""); }
  async function persist(nextContent: HamperContent, publish = false) {
    validateContent(nextContent, publish); if (slug) validateSlug(slug);
    if (pinMode === "set" && !/^\d{4,6}$/.test(pin)) throw new Error("Choose a PIN with 4–6 digits.");
    const saved = await api<Hamper>(`/api/hampers/${hamper.id}`, { method: "PUT", body: JSON.stringify({ content: nextContent, slug: slug || undefined, publish, updatedAt: hamper.updatedAt, ...(pinMode === "keep" ? {} : { pin: pinMode === "set" ? pin : null }) }) });
    accept(saved);
    return saved;
  }
  async function save(publish = false) {
    setMessage(""); setBusy(true);
    try {
      const saved = await persist(content, publish);
      setMessage(publish ? `Ready for ${saved.recipient}. Your link is ready to share.` : "Your hamper is saved."); return true;
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Couldn't save your hamper."); return false; }
    finally { setBusy(false); }
  }
  async function saveItem(item: HamperItem) {
    const added = !editor?.item;
    const items = (editor?.item ? content.items.map(current => current.id === item.id ? item : current) : [...content.items, item]).map((current, position) => ({ ...current, position }));
    setMessage(""); setBusy(true);
    try {
      await persist({ ...content, items });
      setEditor(null); setRecentlyAdded(added ? item.type : null); setMessage(added ? `${HAMPER_ITEM_REGISTRY[item.type].label} added.` : "Your keepsake is saved.");
    } finally { setBusy(false); }
  }
  async function navigate(target: number) {
    if (target > step && step === 0 && (!content.recipient.trim() || !content.sender.trim())) { setMessage("Add both your names before choosing the wrapping."); return; }
    if (dirty && !(await save())) return;
    setStep(target); setMessage(""); setReplay(n => n + 1);
  }
  const activeLink = hamper.links.find(l => l.is_primary && !l.revoked_at), publicUrl = activeLink && hamper.status === "published" ? `/hamper/${activeLink.slug}` : undefined;
  return <StudioShell section="hamper">
    <div className={styles.sectionHeader}><p className={styles.eyebrow}>A digital care package · {hamper.status}</p><button className={styles.quietButton} disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : dirty ? "Save your changes" : "Save hamper"}</button></div>
    <nav aria-label="Hamper creation steps" className={styles.steps}>{steps.map((label, i) => <button key={label} disabled={busy} aria-current={i === step ? "step" : undefined} onClick={() => void navigate(i)}>{i + 1}. {label}</button>)}</nav>
    <h1 className={styles.title}>{step === 6 && publicUrl ? `Ready for ${content.recipient}` : titles[step]}</h1>
    {message && <p role="status" className={styles.notice}>{message}</p>}
    {step === 0 && <div className={styles.form}>
      <label className={styles.field}>Recipient name *<input maxLength={80} required value={content.recipient} onChange={e => { const recipient = e.target.value; patch({ recipient }); if (automaticSlug) setSlug(suggestSlug(recipient, slugSuffix)); }} /></label>
      <label className={styles.field}>Sender name *<input maxLength={80} required value={content.sender} onChange={e => patch({ sender: e.target.value })} /></label>
      <label className={styles.field}>{HAMPER_MESSAGE_FIELD.label}<textarea maxLength={500} value={content.message} onChange={e => patch({ message: e.target.value })} /><small>Revealed after the package opens.</small></label>
      <label className={styles.field}>Your hamper link<input maxLength={48} value={slug} disabled={hamper.status === "published"} onChange={e => { setSlug(e.target.value); setAutomaticSlug(false); setDirty(true); }} /><small>/hamper/{slug} {hamper.status === "published" && "· Change this under Manage links."}</small></label>
    </div>}
    {step === 1 && <div className={styles.themeGrid}>{(Object.entries(HAMPER_THEMES) as [HamperTheme, typeof HAMPER_THEMES[HamperTheme]][]).map(([id, t]) => <button type="button" key={id} className={styles.themeChoice} style={{ background: t.paper }} aria-pressed={content.theme === id} onClick={() => patch({ theme: id })}><span className={styles.themeSwatches} aria-hidden="true"><i style={{ background: t.box }} /><i style={{ background: t.soft }} /><i style={{ background: t.accent }} /></span><strong>{t.name}</strong><small>{t.description}</small></button>)}</div>}
    {step === 2 && <div className={styles.choices}>{(["burst", "scene"] as const).map(style => <button type="button" key={style} className={styles.openingChoice} aria-pressed={content.openingStyle === style} onClick={() => patch({ openingStyle: style })}><span className={styles.openingDemo} style={style === "scene" ? { background: "#e6dbc7", borderBottom: "8px solid #bda584" } : undefined}><ItemIcon type="note" size={44} /><ItemIcon type="gift" size={65} /><ItemIcon type="photo" size={44} /></span><strong>{style === "burst" ? "Burst" : "Scene"}</strong><small>{style === "burst" ? "Everything comes flying out." : "Open into a little world."}</small></button>)}</div>}
    {step === 3 && <><p className={styles.subtitle}>Ten ways to say “I thought of you”. Pick a little object to tuck inside.</p><div className={styles.packedCounter}><strong>{content.items.length} / {HAMPER_LIMITS.maxItemsPerHamper}</strong><span>things packed</span><small>{(content.items.reduce((n, i) => n + i.assetBytes, 0) / 1024 / 1024).toFixed(1)} / {totalAssetLimitMb} MB</small></div>{recentlyAdded && <div className={styles.addAnother} role="status"><span>{HAMPER_ITEM_REGISTRY[recentlyAdded].label} added.</span><button type="button" disabled={content.items.length >= HAMPER_LIMITS.maxItemsPerHamper || content.items.filter(i => i.type === recentlyAdded).length >= HAMPER_ITEM_REGISTRY[recentlyAdded].max} onClick={() => { setEditor({ type: recentlyAdded }); setRecentlyAdded(null); }}>Add another {HAMPER_ITEM_REGISTRY[recentlyAdded].label.toLowerCase()}</button><button type="button" onClick={() => setRecentlyAdded(null)}>Done</button></div>}<div className={styles.itemGrid}>{ITEM_TYPES.map((type, index) => { const count = content.items.filter(i => i.type === type).length; return <button type="button" key={type} className={styles.itemChoice} aria-label={HAMPER_ITEM_REGISTRY[type].label} disabled={content.items.length >= HAMPER_LIMITS.maxItemsPerHamper || count >= HAMPER_ITEM_REGISTRY[type].max} onClick={() => { setEditor({ type }); setRecentlyAdded(null); }}><ItemObject type={type} instanceIndex={index} theme={content.theme} /><span>{HAMPER_ITEM_REGISTRY[type].label}</span><small>{count} / {HAMPER_LIMITS.maxItemsPerType}</small></button>; })}</div></>}
    {(step === 3 || step === 4) && <><div className={styles.sectionHeader}><h2 className={styles.heading}>Inside your hamper</h2></div>{step === 4 && <p className={styles.subtitle}>Drag the little handle to arrange your keepsakes, or use the arrow buttons.</p>}{content.items.length ? <ArrangeItems items={content.items} onChange={items => patch({ items })} onEdit={item => setEditor({ type: item.type, item })} /> : <p className={styles.empty}>A little room for something lovely. Choose an item to tuck inside.</p>}</>}
    {step === 5 && <><div className={styles.actions}><button className={styles.quietButton} aria-pressed={!mobile} onClick={() => { setMobile(false); setReplay(n => n + 1); }}>Desktop preview</button><button className={styles.quietButton} aria-pressed={mobile} onClick={() => { setMobile(true); setReplay(n => n + 1); }}>Mobile preview</button><button className={styles.quietButton} onClick={() => setReplay(n => n + 1)}>Replay opening</button></div><div className={styles.preview} data-mobile={mobile}><Recipient key={replay} content={content} resolveAsset={resolveAsset} /></div></>}
    {step === 6 && <>
      <p className={styles.subtitle}>{publicUrl ? "Send a few good things their way. The recipient doesn't need an Ode account." : "A free, unlisted link. Made by you, opened by someone you love."}</p>
      <div className={styles.form}><label className={styles.field}>Privacy<select className={styles.quietButton} value={pinMode} onChange={e => { setPinMode(e.target.value as typeof pinMode); setDirty(true); }}><option value="keep">{hamper.hasPin ? "Keep the current PIN" : "Unlisted — anyone with the link"}</option><option value="set">{hamper.hasPin ? "Choose a new PIN" : "Add a PIN"}</option>{hamper.hasPin && <option value="remove">Remove the PIN</option>}</select></label>{pinMode === "set" && <label className={styles.field}>4–6 digit PIN<input type="password" autoComplete="new-password" inputMode="numeric" maxLength={6} pattern="[0-9]{4,6}" value={pin} onChange={e => { setPin(e.target.value); setDirty(true); }} /><small>Share the PIN separately with your recipient.</small></label>}</div>
      <div className={styles.actions}><button className={styles.button} disabled={busy} onClick={() => void save(true)}>{busy ? "Wrapping it up…" : hamper.status === "published" ? "Save published hamper" : "Publish hamper"}</button></div>
      {publicUrl && <><p className={styles.linkLine}><a href={publicUrl}>{typeof window === "undefined" ? publicUrl : new URL(publicUrl, location.origin).href}</a></p><div className={styles.actions}><button className={styles.quietButton} onClick={() => void shareLink(publicUrl, `For ${hamper.recipient}`, true).then(setMessage).catch(() => undefined)}>Copy link</button><button className={styles.quietButton} onClick={() => void shareLink(publicUrl, `For ${hamper.recipient}`).then(setMessage).catch(() => undefined)}>Share hamper</button><button className={styles.quietButton} onClick={() => void navigate(5)}>Open preview</button><a href="#links" className={styles.quietButton}>Manage privacy</a></div></>}
      {!dirty && <ManageHamper hamper={hamper} onChange={accept} />}
    </>}
    <footer className={styles.footer}><button className={styles.quietButton} disabled={step === 0 || busy} onClick={() => void navigate(step - 1)}>← Back</button><span className={styles.eyebrow}>{dirty ? "Changes to save" : "Saved in your studio"}</span>{step < 6 && <button className={styles.button} disabled={busy} onClick={() => void navigate(step + 1)}>{step === 5 ? "Wrap it up" : "Save & continue"} →</button>}</footer>
    {editor && <ItemEditor hamperId={hamper.id} type={editor.type} item={editor.item} onClose={() => setEditor(null)} onSave={saveItem} />}
  </StudioShell>;
}
