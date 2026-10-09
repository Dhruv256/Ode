import { ASK_OUT_INTERESTS, ASK_OUT_THEMES, MINI_GAMES, weekdayFor } from "./config";
import { EMPTY_ASK_OUT, type AskOutContent } from "./types";

export class AskOutValidationError extends Error { constructor(message: string) { super(message); this.name = "AskOutValidationError"; } }
const text = (value: unknown, label: string, max: number, required = false) => {
  if (typeof value !== "string") throw new AskOutValidationError(`${label} is invalid.`);
  const clean = value.trim();
  if (required && !clean) throw new AskOutValidationError(`${label} is required.`);
  if (clean.length > max) throw new AskOutValidationError(`${label} is too long.`);
  return clean;
};
const allowedInterests = new Set(ASK_OUT_INTERESTS.map(i => i.id));
const allowedGames = new Set(MINI_GAMES.map(i => i.id));

export function validateAskOut(value: unknown, publishing = false): AskOutContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new AskOutValidationError("Ask Out content is invalid.");
  const v = value as Record<string, unknown>;
  const theme = v.theme;
  if (typeof theme !== "string" || !(theme in ASK_OUT_THEMES)) throw new AskOutValidationError("Choose a valid theme.");
  const interests = Array.isArray(v.interests) ? Array.from(new Set(v.interests)) : [];
  if (interests.length > 6 || interests.some(i => typeof i !== "string" || !allowedInterests.has(i as never))) throw new AskOutValidationError("Choose up to six valid interests.");
  const miniGames = Array.isArray(v.miniGames) ? Array.from(new Set(v.miniGames)) : [];
  if (miniGames.length > 5 || miniGames.some(i => typeof i !== "string" || !allowedGames.has(i as never))) throw new AskOutValidationError("Choose up to five interactions.");
  if (miniGames.some(id => !MINI_GAMES.find(game => game.id === id)?.themes.includes(theme as keyof typeof ASK_OUT_THEMES))) throw new AskOutValidationError("Choose interactions that belong to this theme.");
  const date = text(v.date ?? "", "Date", 10, publishing);
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AskOutValidationError("Choose a valid date.");
  const weekday = date ? weekdayFor(date) : text(v.weekday ?? "", "Day", 10);
  const rawOptions = Array.isArray(v.dayOptions) ? v.dayOptions : [];
  if (rawOptions.length > 3) throw new AskOutValidationError("Use three day choices.");
  const dayOptions = rawOptions.map((option, index) => {
    const item = option && typeof option === "object" ? option as Record<string, unknown> : {};
    return { id: text(item.id ?? `option-${index}`, "Day option", 30, true), label: text(item.label ?? "", "Day option", 100, publishing) };
  });
  if (publishing && dayOptions.length !== 3) throw new AskOutValidationError("Add all three playful day choices.");
  return {
    ...EMPTY_ASK_OUT,
    recipientName: text(v.recipientName ?? "", "Recipient name", 80, publishing),
    recipientTag: text(v.recipientTag ?? "", "Recipient tag", 50),
    creatorName: text(v.creatorName ?? "", "Your name", 80, publishing),
    openingMessage: text(v.openingMessage ?? "", "Opening message", 240),
    playfulJourney: v.playfulJourney === true,
    playfulIntensity: v.playfulIntensity === "light" || v.playfulIntensity === "chaotic" ? v.playfulIntensity : "mischievous",
    recurringJoke: text(v.recurringJoke ?? "", "Recurring joke", 180),
    finalInvitationLine: text(v.finalInvitationLine ?? "", "Final invitation line", 180),
    acceptedMessage: text(v.acceptedMessage ?? "", "Accepted message", 160),
    declineMessage: text(v.declineMessage ?? "", "Decline message", 160),
    interests: interests as AskOutContent["interests"], customInterest: text(v.customInterest ?? "", "Custom interest", 60),
    date, weekday, pickupTime: text(v.pickupTime ?? "", "Pickup time", 5, publishing), endTime: text(v.endTime ?? "", "End time", 5),
    pickupLocation: text(v.pickupLocation ?? "", "Pickup location", 180), meetingPoint: text(v.meetingPoint ?? "", "Meeting point", 180),
    destination: text(v.destination ?? "", "Destination", 180, publishing), mapAddress: text(v.mapAddress ?? "", "Map address", 300, publishing),
    activity: text(v.activity ?? "", "Activity", 160, publishing), dressCodeJoke: text(v.dressCodeJoke ?? "", "Dress-code joke", 160),
    specialNote: text(v.specialNote ?? "", "Special note", 300), reservationInfo: text(v.reservationInfo ?? "", "Reservation info", 200),
    additionalDetails: text(v.additionalDetails ?? "", "Additional details", 600), theme: theme as AskOutContent["theme"],
    extraCuteLine: text(v.extraCuteLine ?? "", "Extra cute line", 180),
    miniGames: miniGames as AskOutContent["miniGames"], dayQuestion: text(v.dayQuestion ?? EMPTY_ASK_OUT.dayQuestion, "Day question", 140, true),
    dayOptions, timeQuestion: text(v.timeQuestion ?? EMPTY_ASK_OUT.timeQuestion, "Time question", 140, true),
  };
}

export function validateAskOutSlug(value: unknown) {
  if (typeof value !== "string") throw new AskOutValidationError("Choose a valid link.");
  const slug = value.toLowerCase().trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 64) throw new AskOutValidationError("Use 3–64 letters, numbers or hyphens for the link.");
  if (["new", "edit", "create", "dashboard", "api", "hamper"].includes(slug)) throw new AskOutValidationError("That link is reserved.");
  return slug;
}
