import type { AskOutInterest, AskOutMiniGame, AskOutTheme, DayOption } from "./types";

export type AskOutThemeDefinition = {
  name: string; description: string; asset: string; vibe: string; cuteness: string; tone: string;
  recommended: string; exampleFlow: string; interactions: AskOutMiniGame[];
};
export const ASK_OUT_THEMES: Record<AskOutTheme, AskOutThemeDefinition> = {
  "tagged-message": { name: "Tagged Message", description: "A suspicious notification made for exactly one person.", asset: "/askout-assets/tagged-message.webp", vibe: "Modern · minimal · mysterious", cuteness: "Cute details, clean edges", tone: "Funny 70 / romantic 30", recommended: "Internet-native people who appreciate a clever bit.", exampleFlow: "Notification → swipe → peel → reveal", interactions: ["notification-tap", "swipe-open", "sticker-peel", "repelling-no"] },
  "cat-investigation": { name: "Cat Investigation", description: "A cozy detective has intercepted a very promising case.", asset: "/askout-assets/cat-investigation.webp", vibe: "Cozy · adorable · investigative", cuteness: "Maximum cat, adult art direction", tone: "Funny 75 / romantic 25", recommended: "Cat people, cozy-date people and committed bit-enjoyers.", exampleFlow: "Pet → evidence → scratch → paw stamp", interactions: ["cat-pet", "evidence-board", "scratch-clue", "paw-stamp"] },
  "magical-message": { name: "Magical Message", description: "Soft fantasy mail with one entirely unofficial spell.", asset: "/askout-assets/magical-message.webp", vibe: "Whimsical · dreamy · bookish", cuteness: "Gentle owl-and-envelope charm", tone: "Funny 45 / romantic 55", recommended: "Fantasy readers and people who like a little wonder.", exampleFlow: "Catch owl → open mail → trace spell → break seal", interactions: ["owl-catch", "envelope-open", "wand-trail", "seal-break"] },
  "scrapbook": { name: "Sticker Scrapbook", description: "A polished Y2K page assembled from tiny affectionate evidence.", asset: "/askout-assets/scrapbook.webp", vibe: "Handmade · Y2K · sticker-book", cuteness: "Playful, tactile and very put-together", tone: "Funny 60 / romantic 40", recommended: "Creative people, photo hoarders and excellent sticker users.", exampleFlow: "Open cover → drag sticker → flip photo → tape note", interactions: ["scrapbook-cover", "sticker-drag", "flip-polaroid", "tape-note"] },
  "tiny-exhibit": { name: "Tiny Exhibit", description: "A miniature gallery tour whose final object is the invitation.", asset: "/askout-assets/tiny-exhibit.webp", vibe: "Editorial · clever · curated", cuteness: "Small museum, serious presentation", tone: "Funny 55 / romantic 45", recommended: "Design, art and museum-date people.", exampleFlow: "Enter → inspect plaque → aim spotlight → stamp ticket", interactions: ["exhibit-enter", "plaque-tap", "spotlight", "ticket-stamp"] },
};

export const ASK_OUT_INTERESTS: { id: AskOutInterest; label: string }[] = [
  ["cats", "Cats"], ["dogs", "Dogs"], ["wizarding", "Wizarding"], ["fiction-books", "Fiction books"],
  ["movies", "Movies"], ["f1", "F1"], ["football", "Football"], ["gaming", "Gaming"],
  ["music", "Music"], ["coffee", "Coffee"], ["food", "Food"], ["travel", "Travel"],
].map(([id, label]) => ({ id: id as AskOutInterest, label }));

export const MINI_GAMES: { id: AskOutMiniGame; name: string; description: string; themes: AskOutTheme[] }[] = [
  { id:"notification-tap",name:"Notification tap",description:"Open the tagged alert.",themes:["tagged-message"] }, { id:"swipe-open",name:"Swipe to open",description:"Slide the message out of quarantine.",themes:["tagged-message"] }, { id:"sticker-peel",name:"Sticker peel",description:"Hold to peel a classified sticker.",themes:["tagged-message"] }, { id:"repelling-no",name:"Repelling No",description:"A harmless early No with evasive instincts.",themes:["tagged-message"] }, { id:"clue-cards",name:"Clue cards",description:"Tap to expand small clues.",themes:["tagged-message","cat-investigation","tiny-exhibit"] },
  { id:"cat-pet",name:"Pet the detective",description:"One respectful head pat grants access.",themes:["cat-investigation"] }, { id:"evidence-board",name:"Evidence board",description:"Drag the last clue into position.",themes:["cat-investigation"] }, { id:"scratch-clue",name:"Scratch clue",description:"Scratch away the cat-approved cover.",themes:["cat-investigation"] }, { id:"paw-stamp",name:"Paw stamp",description:"Receive official feline approval.",themes:["cat-investigation"] }, { id:"cat-nudge",name:"Cat nudge",description:"The detective nudges the useful clue.",themes:["cat-investigation"] },
  { id:"owl-catch",name:"Catch the courier",description:"Tap the tiny owl before it circles again.",themes:["magical-message"] }, { id:"envelope-open",name:"Envelope open",description:"Unfold the special delivery.",themes:["magical-message"] }, { id:"wand-trail",name:"Trace a spell",description:"Draw a short, original light trail.",themes:["magical-message"] }, { id:"floating-note",name:"Floating note",description:"Catch a drifting parchment clue.",themes:["magical-message"] }, { id:"seal-break",name:"Break the seal",description:"Crack the plain wax seal.",themes:["magical-message"] },
  { id:"scrapbook-cover",name:"Scrapbook cover",description:"Open the handmade first page.",themes:["scrapbook"] }, { id:"sticker-drag",name:"Place a sticker",description:"Drag a sticker into the composition.",themes:["scrapbook"] }, { id:"flip-polaroid",name:"Flip a Polaroid",description:"Turn a tiny photo for the clue.",themes:["scrapbook"] }, { id:"tape-note",name:"Tape the note",description:"Slide a strip of tape into place.",themes:["scrapbook"] }, { id:"foil-scratch",name:"Scratch the foil",description:"Reveal a bright detail underneath.",themes:["scrapbook"] },
  { id:"exhibit-enter",name:"Enter exhibit",description:"Open the miniature gallery.",themes:["tiny-exhibit"] }, { id:"plaque-tap",name:"Inspect plaque",description:"Expand the curator's caption.",themes:["tiny-exhibit"] }, { id:"spotlight",name:"Aim spotlight",description:"Guide the light to the next object.",themes:["tiny-exhibit"] }, { id:"gallery-swipe",name:"Gallery swipe",description:"Browse the pocket-sized collection.",themes:["tiny-exhibit"] }, { id:"ticket-stamp",name:"Stamp ticket",description:"Validate the visitor pass.",themes:["tiny-exhibit"] },
  { id:"chapter-card",name:"Chapter card",description:"Open a tiny narrative heading.",themes:["magical-message","scrapbook","tiny-exhibit"] }, { id:"page-flip",name:"Page flip",description:"Turn one short story page.",themes:["magical-message","scrapbook"] }, { id:"bookmark-reveal",name:"Bookmark reveal",description:"Pull a bookmark to uncover a line.",themes:["magical-message","scrapbook"] },
];

export function compatibleInteractions(theme: AskOutTheme) { return MINI_GAMES.filter(item => item.themes.includes(theme)); }

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function funnyDayOptions(weekday: string, variant = 0, theme: AskOutTheme = "tagged-message"): DayOption[] {
  const index = DAYS.indexOf(weekday);
  if (index < 0) return [];
  const before = DAYS[(index + 6) % 7], after = DAYS[(index + 1) % 7];
  const themeOptions: Record<AskOutTheme, Array<[string, string, string]>> = {
    "tagged-message": [
      [`Day after ${before}`, `Day before ${after}`, `${weekday}, because subtlety is overrated`],
      [`${before}’s sequel`, `${after}’s prequel`, `${weekday}, according to available evidence`],
      [`Not ${before}`, `Not ${after}`, `${weekday}. Final answer. No notes.`],
    ],
    "cat-investigation": [
      [`After ${before}`, `Before ${after}`, weekday],
      [`${before}, plus one clue`, `${after}, minus one clue`, `${weekday}. Paw-certified.`],
      [`Not quite ${before}`, `Nearly ${after}`, `${weekday}, detective’s ruling`],
    ],
    "magical-message": [
      [`The day following ${before}`, `The day preceding ${after}`, `${weekday}, according to several ancient texts`],
      [`${before} + one moonrise`, `${after} − one moonrise`, `${weekday}, the stars insist`],
      [`After ${before}, mysteriously`, `Before ${after}, somehow`, `${weekday}. No spell required.`],
    ],
    scrapbook: [
      [`${before} + 1`, `${after} − 1`, `${weekday} ✿`],
      [`After-${before} sticker`, `Before-${after} sticker`, `${weekday}, circled twice`],
      [`${before}’s next page`, `${after}’s previous page`, `${weekday} ★`],
    ],
    "tiny-exhibit": [
      [`After ${before}`, `Before ${after}`, weekday],
      [`Study after ${before}`, `Study before ${after}`, `${weekday}, mixed media`],
      [`${before}, continued`, `${after}, previewed`, `${weekday}, artist’s choice`],
    ],
  };
  const [first, second, third] = themeOptions[theme][variant % themeOptions[theme].length];
  return [
    { id: "after", label: first },
    { id: "before", label: second },
    { id: "obvious", label: third },
  ];
}

const pad = (value: number) => String(value).padStart(2, "0");
const displayClock = (minutes: number) => {
  const safe = (minutes + 24 * 60) % (24 * 60), hour = Math.floor(safe / 60), minute = safe % 60;
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};
export function funnyTimeOptions(time: string, theme: AskOutTheme) {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return [];
  const value = hour * 60 + minute, before = displayClock(value - 1), exact = displayClock(value), after = displayClock(value + 1);
  const labels: Record<AskOutTheme, [string, string, string]> = {
    "tagged-message": [`${before} — suspiciously early`, `${exact} — correct answer`, `${after} — chaos`],
    "cat-investigation": [`${before} — premature stakeout`, `${exact} — time of incident`, `${after} — suspect is late`],
    "magical-message": [`${before} — owl still circling`, `${exact} — prophecy`, `${after} — forbidden by the stars`],
    scrapbook: [`${before} — almost sticker`, `${exact} — circled twice`, `${after} — tiny crisis`],
    "tiny-exhibit": [`${before} — early period`, `${exact} — definitive work`, `${after} — late period`],
  };
  return labels[theme].map((label, index) => ({ id: `${pad(index)}-${time}`, label, value: time }));
}

export function weekdayFor(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const [year, month, day] = date.split("-").map(Number);
  return DAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}
