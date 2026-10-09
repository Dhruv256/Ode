import type { AskOutContent, AskOutInterest, AskOutTheme } from "./types";

export type AskOutCopyIntent = "another" | "funnier" | "cuter" | "less-romantic" | "more-romantic" | "drier" | "shorter";
export type AskOutCopyFields = Pick<AskOutContent, "openingMessage" | "recurringJoke" | "finalInvitationLine" | "acceptedMessage" | "declineMessage">;

type ThemeVoice = {
  loading: string;
  error: string;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  dayEyebrow: string;
  dayTitle: (name: string) => string;
  dayNote: string;
  planEyebrow: string;
  locationLabel: string;
  timeTitle: string;
  planButton: string;
  finalEyebrow: string;
  finalQuestion: (creator: string) => string;
  finalSub: string;
  yes: string;
  more: string;
  no: string;
  acceptedEyebrow: string;
  acceptedTitle: string;
  acceptedSmall: string;
  declinedEyebrow: string;
  declinedTitle: string;
  declinedSmall: string;
};

export const ASK_OUT_VOICE: Record<AskOutTheme, ThemeVoice> = {
  "tagged-message": {
    loading: "Decrypting unnecessary mystery…", error: "The message lost its context. Try that again.",
    storyEyebrow: "Context, reluctantly", storyTitle: "Okay. The conspiracy is becoming clearer.", storyBody: "The sender checks out. The planning is suspiciously competent.",
    dayEyebrow: "Operation calendar", dayTitle: name => `One ideal day. Identify it, ${name}.`, dayNote: "Subtlety was not invited.",
    planEyebrow: "Current evidence suggests", locationLabel: "Coordinates", timeTitle: "Highly classified departure time", planButton: "Reveal actual reason",
    finalEyebrow: "Okay, actual reason you were tagged", finalQuestion: creator => `Would you go on a date with ${creator}?`, finalSub: "One plan. Three normal answers. No tricks.",
    yes: "Yes :)", more: "Tell me more", no: "Not this time",
    acceptedEyebrow: "Response received", acceptedTitle: "Case closed. Date confirmed.", acceptedSmall: "This notification may now self-destruct.",
    declinedEyebrow: "Response received", declinedTitle: "Fair enough :)", declinedSmall: "Message archived. No weird follow-up.",
  },
  "cat-investigation": {
    loading: "Detective reviewing evidence…", error: "The cat knocked the internet over. Save again.",
    storyEyebrow: "Case file #001", storyTitle: "The detective has reached a preliminary conclusion.", storyBody: "Motive: a good plan. Alibi: honestly, none required.",
    dayEyebrow: "Timeline evidence", dayTitle: () => "Three completely different options remain.", dayNote: "Remarkable detective work.",
    planEyebrow: "Primary lead", locationLabel: "Scene of the alleged date", timeTitle: "Time of incident", planButton: "Read conclusion",
    finalEyebrow: "Detective’s conclusion", finalQuestion: creator => `One date with ${creator}. Gather more evidence?`, finalSub: "The cat considers the case promising.",
    yes: "Approve investigation", more: "Need more evidence", no: "Close case",
    acceptedEyebrow: "Case status: approved", acceptedTitle: "Investigation approved.", acceptedSmall: "The detective requests payment in treats.",
    declinedEyebrow: "Case closed", declinedTitle: "The detective respects the ruling.", declinedSmall: "No appeal. No guilt. One tiny stamp filed away.",
  },
  "magical-message": {
    loading: "Owl consulting management…", error: "The owl dropped something. Try again.",
    storyEyebrow: "Letter, finally opened", storyTitle: "The letter eventually gets to the point.", storyBody: "No prophecy. No perilous quest. Just a thoughtfully specific plan.",
    dayEyebrow: "Astronomical scheduling", dayTitle: () => "The stars aligned on one convenient day.", dayNote: "Several ancient texts agree.",
    planEyebrow: "The revealed itinerary", locationLabel: "Where the letter is sending you", timeTitle: "The prophecy gets weirdly specific", planButton: "Read final line",
    finalEyebrow: "One final line remains", finalQuestion: creator => `Would you go on a date with ${creator}?`, finalSub: "The owl is pretending not to listen.",
    yes: "Accept invitation", more: "Read the footnotes", no: "Not this time",
    acceptedEyebrow: "Prophecy: suspiciously accurate", acceptedTitle: "The letter got it right.", acceptedSmall: "The owl may now retire.",
    declinedEyebrow: "The universe has been informed", declinedTitle: "The universe accepts your decision.", declinedSmall: "The owl, slightly less gracefully, does too.",
  },
  scrapbook: {
    loading: "Finding another sticker…", error: "A sticker covered the save button. Try again.",
    storyEyebrow: "Pasted note", storyTitle: "Things apparently worth putting in a scrapbook.", storyBody: "Good plans. Tiny keepsakes. This suspicious invitation.",
    dayEyebrow: "Scheduling, but make it stationery", dayTitle: () => "Pick one completely unique option.", dayNote: "They are, somehow, the same day.",
    planEyebrow: "Today’s very important plan", locationLabel: "Where the plot happens", timeTitle: "Tiny scheduling crisis", planButton: "Turn to last page",
    finalEyebrow: "Last page. Actual question.", finalQuestion: creator => `Date? With ${creator}, for legal clarity.`, finalSub: "The tape is decorative. The question is real.",
    yes: "Okay cute", more: "Need details", no: "Not this time",
    acceptedEyebrow: "Sticker of approval unlocked", acceptedTitle: "Adding this to the good-pages section.", acceptedSmall: "Very exclusive. Limited edition.",
    declinedEyebrow: "Page closed", declinedTitle: "No worries at all.", declinedSmall: "The scrapbook respects editorial decisions.",
  },
  "tiny-exhibit": {
    loading: "Curator adjusting tiny plaque…", error: "This exhibit is briefly closed. Try again.",
    storyEyebrow: "Curator’s note", storyTitle: "The collection has acquired a possible evening.", storyBody: "Experts believe it could be used for something interesting.",
    dayEyebrow: "Interactive installation: choose a day", dayTitle: () => "Three interpretations are currently on display.", dayNote: "All valid. Conveniently, also identical.",
    planEyebrow: "Exhibit 02 · The proposed activity", locationLabel: "Site-specific installation", timeTitle: "Study in temporal precision", planButton: "Open final exhibit",
    finalEyebrow: "Final piece", finalQuestion: () => "Untitled (Should We Go On a Date?)", finalSub: "Two people, one plan, uncertain sequel.",
    yes: "Acquire artwork", more: "More curator notes", no: "Not for my collection",
    acceptedEyebrow: "Exhibition extended", acceptedTitle: "The collection has a new opening date.", acceptedSmall: "One evening only. Excellent acquisition.",
    declinedEyebrow: "Exhibition concluded", declinedTitle: "Thank you for visiting.", declinedSmall: "No membership drive will follow.",
  },
};

const INTEREST_LINES: Partial<Record<AskOutInterest, string[]>> = {
  cats: ["Reviewed by one feline consultant.", "Paw-certified."],
  "fiction-books": ["Possible Chapter One.", "Plot development detected."],
  coffee: ["Caffeine may be involved.", "Bean-based negotiations remain possible."],
  gaming: ["Party size: 2.", "Optional second-date DLC not included yet."],
  f1: ["Formation lap complete.", "DRS unavailable for escaping awkward silences."],
  movies: ["Casting appears suspiciously specific.", "Sequel depends on box office performance."],
  food: ["Critics recommend dessert.", "Plot heavily involves eating."],
  music: ["The soundtrack department is standing by."],
  travel: ["A very local adventure still counts."],
  dogs: ["Canine legal raised no objections."],
  football: ["Extra time remains optional."],
  wizarding: ["No wand required for scheduling."],
};

export function interestCallbacks(content: AskOutContent) {
  const lines = content.interests.flatMap(interest => INTEREST_LINES[interest] || []).filter(Boolean);
  if (content.customInterest.trim()) lines.push(`${content.customInterest.trim()} may have influenced the committee.`);
  return Array.from(new Set(lines)).slice(0, 2);
}

const copySets: Record<AskOutTheme, Array<[string, string, string, string, string]>> = {
  "tagged-message": [
    ["@{tag} — private notification. Public curiosity discouraged.", "Legal says it cannot actually self-destruct.", "Would you go on a date with {creator}?", "Case closed. Date confirmed.", "Message closed. No weird follow-up."],
    ["@{tag}: 1 unread message. Probably important. Possibly nonsense.", "This interface has trust issues.", "Okay, actual reason you were tagged: date with {creator}?", "Bold click. Excellent result.", "Fair enough :) Message archived."],
    ["Someone saved a suspiciously nice plan for @{tag}.", "Tiny planning committee: cautiously excited.", "Would you like to go somewhere nice with {creator}?", "Okay, this is officially happening.", "No worries. The notification understands."],
    ["@{tag}, you have one private plan to review.", "Context available on request.", "Interested in a date with {creator}?", "Plan accepted.", "Response noted. Take care."],
    ["Someone thought of you, then made an unnecessarily good notification.", "The confidence is mostly decorative.", "Would you go on one lovely, low-pressure date with {creator}?", "Very good. There is now a date to look forward to.", "No worries at all. Thanks for answering."],
    ["@{tag}: notification.", "Administrative mystery persists.", "Date with {creator}?", "Confirmed.", "Declined. Understood."],
    ["@{tag}, suspicious message.", "Noted.", "Date with {creator}?", "Date confirmed.", "No worries."],
  ],
  "cat-investigation": [
    ["CASE FILE #001: Why is {recipient} being investigated?", "Lead detective: one extremely underqualified cat.", "Approve one date with {creator}?", "CASE STATUS: APPROVED", "CASE CLOSED"],
    ["A cat opened a formal investigation into {recipient}’s plans.", "Bribery is permitted if the bribe is a treat.", "Should {creator} join the investigation over one date?", "Bribe accepted. Date proceeds.", "Case closed. The cat shredded no documents."],
    ["The tiny detective has a very promising case for {recipient}.", "Morale improves dramatically with head pats.", "One cute little date with {creator}?", "Paw-certified and calendar-ready.", "The detective respects the verdict."],
    ["File opened for {recipient}.", "Feline consultant retained.", "Approve a date with {creator}?", "Approved by feline authorities.", "File closed without appeal."],
    ["The detective thinks {recipient} and {creator} deserve one nice evening.", "Professional distance has been compromised by purring.", "Would you gather more evidence over a date with {creator}?", "The case now has a very good next chapter.", "No worries. The detective remains fond and professional."],
    ["SUBJECT: {recipient}. STATUS: interesting.", "The investigator has no relevant qualifications.", "Proceed with {creator}?", "Ruling: approved.", "Ruling: declined and respected."],
    ["CASE: {recipient}.", "Cat approved.", "Date with {creator}?", "Approved.", "Case closed."],
  ],
  "magical-message": [
    ["SPECIAL DELIVERY FOR {recipient}", "The owl refuses to explain the urgency.", "Would you go on a date with {creator}?", "The prophecy was suspiciously accurate.", "The universe accepts your decision."],
    ["Your letter arrived late. The owl blames traffic.", "Excellent. Bureaucracy nearly defeated.", "One date with {creator}, before the owl invoices us?", "The owl can finally stop circling.", "The owl accepts this with limited grace."],
    ["A small, warm letter found its way to {recipient}.", "One star has been assigned to quality control.", "Would you share one lovely evening with {creator}?", "The letter got the ending it hoped for.", "This chapter ends gently here."],
    ["Delivery for {recipient}. Owl unverified.", "Minor enchantment. Normal scheduling.", "Accept a date with {creator}?", "Invitation accepted.", "Decision accepted."],
    ["This letter crossed a ridiculous amount of sky to ask {recipient} one thing.", "The owl is emotionally invested but behaving professionally.", "Would you go on a quietly wonderful date with {creator}?", "The stars got one thing exactly right.", "The universe understands. So does {creator}."],
    ["Letter for {recipient}. Courier: owl.", "The parchment has opinions.", "Date with {creator}?", "Prophecy confirmed.", "Prophecy withdrawn."],
    ["Owl post for {recipient}.", "Seal broken.", "Date with {creator}?", "Confirmed.", "Understood."],
  ],
  scrapbook: [
    ["A VERY SERIOUS PAGE ABOUT {recipient}", "Sticker caption: not actually serious.", "Date? With {creator}, for legal clarity.", "STICKER OF APPROVAL UNLOCKED", "Page closed. No worries."],
    ["Things worth scrapbooking: snacks, good songs, this invitation.", "The tape is carrying the entire operation.", "Okay, plot twist: date with {creator}?", "Excellent cutting and pasting. Date secured.", "Editorial decision accepted."],
    ["Someone made {recipient} a tiny page with suspiciously nice intentions.", "Every sticker was selected by committee.", "Would you go on one very cute date with {creator}?", "Adding this to the good-pages section.", "No worries. This page still gets to be cute."],
    ["A small invitation for {recipient}.", "Assembly marks remain visible.", "Interested in a date with {creator}?", "Plan added to calendar.", "Answer noted. Page closed."],
    ["This page exists because {creator} thought {recipient} deserved a lovely plan.", "The crooked tape is part of the charm.", "Would you make one very good memory with {creator}?", "Limited-edition good news.", "No pressure. The scrapbook keeps the nice thought."],
    ["PAGE: {recipient}. PURPOSE: pending.", "Adhesive confidence: moderate.", "Date with {creator}?", "Approved for print.", "Rejected from this edition."],
    ["A page for {recipient}.", "Cute, allegedly.", "Date with {creator}?", "Approved.", "No worries."],
  ],
  "tiny-exhibit": [
    ["WELCOME TO A VERY SMALL EXHIBITION, {recipient}", "Admission: free. Emotional commitment: none yet.", "Should {recipient} and {creator} go on a date?", "EXHIBITION EXTENDED", "EXHIBITION CONCLUDED"],
    ["A museum opened one room and somehow made it about {recipient}.", "Critics call the gift shop ‘nonexistent.’", "Acquire one date with {creator}?", "A bold acquisition. Paperwork pending.", "Not for the collection. Curator informed."],
    ["One tiny exhibition was curated with {recipient} in mind.", "The smallest plaque received the most attention.", "Would you visit somewhere lovely with {creator}?", "The collection has a new favourite evening.", "Thank you for visiting. Truly."],
    ["Visitor: {recipient}. Exhibit: possible date.", "Artist’s intentions remain unclear.", "Proceed with {creator}?", "Acquisition confirmed.", "Acquisition declined."],
    ["The final piece is simply two people making time for each other.", "The curator is trying very hard not to call that romantic.", "Would you spend one thoughtfully planned evening with {creator}?", "Exhibition extended for one excellent evening.", "The exhibit closes here, with no hard feelings."],
    ["EXHIBIT: {recipient}. MEDIUM: scheduling.", "Institutional confidence: cautious.", "Date with {creator}?", "Collection updated.", "Collection unchanged."],
    ["Welcome, {recipient}.", "Tiny museum.", "Date with {creator}?", "Extended.", "Concluded."],
  ],
};

function interpolate(value: string, content: AskOutContent) {
  const tag = content.recipientTag.trim().replace(/^@/, "") || content.recipientName || "you";
  return value.replaceAll("{tag}", tag).replaceAll("{recipient}", content.recipientName || "you").replaceAll("{creator}", content.creatorName || "the sender");
}

export function suggestedCopy(content: AskOutContent, intent: AskOutCopyIntent, alternate = 0): AskOutCopyFields {
  const intentIndex: Record<Exclude<AskOutCopyIntent, "another">, number> = { funnier: 1, cuter: 2, "less-romantic": 3, "more-romantic": 4, drier: 5, shorter: 6 };
  const index = intent === "another" ? alternate % copySets[content.theme].length : intentIndex[intent];
  const [openingMessage, recurringJoke, finalInvitationLine, acceptedMessage, declineMessage] = copySets[content.theme][index];
  return Object.fromEntries(Object.entries({ openingMessage, recurringJoke, finalInvitationLine, acceptedMessage, declineMessage }).map(([key, value]) => [key, interpolate(value, content)])) as AskOutCopyFields;
}
