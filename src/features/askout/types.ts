export type AskOutTheme = "tagged-message" | "cat-investigation" | "magical-message" | "scrapbook" | "tiny-exhibit";
export type AskOutInterest = "cats" | "dogs" | "wizarding" | "fiction-books" | "movies" | "f1" | "football" | "gaming" | "music" | "coffee" | "food" | "travel";
export type AskOutMiniGame =
  | "notification-tap" | "swipe-open" | "sticker-peel" | "repelling-no" | "clue-cards"
  | "cat-pet" | "evidence-board" | "scratch-clue" | "paw-stamp" | "cat-nudge"
  | "owl-catch" | "envelope-open" | "wand-trail" | "floating-note" | "seal-break"
  | "scrapbook-cover" | "sticker-drag" | "flip-polaroid" | "tape-note" | "foil-scratch"
  | "exhibit-enter" | "plaque-tap" | "spotlight" | "gallery-swipe" | "ticket-stamp"
  | "chapter-card" | "page-flip" | "bookmark-reveal";
export type AskOutStatus = "draft" | "published";
export type AskOutResponseKind = "viewed" | "started" | "tell_more" | "accepted" | "declined";
export type AskOutPlayfulIntensity = "light" | "mischievous" | "chaotic";

export type DayOption = { id: string; label: string };

export interface AskOutContent {
  recipientName: string;
  recipientTag: string;
  creatorName: string;
  openingMessage: string;
  playfulJourney: boolean;
  playfulIntensity: AskOutPlayfulIntensity;
  recurringJoke: string;
  finalInvitationLine: string;
  acceptedMessage: string;
  declineMessage: string;
  interests: AskOutInterest[];
  customInterest: string;
  date: string;
  weekday: string;
  pickupTime: string;
  endTime: string;
  pickupLocation: string;
  meetingPoint: string;
  destination: string;
  mapAddress: string;
  activity: string;
  dressCodeJoke: string;
  specialNote: string;
  reservationInfo: string;
  additionalDetails: string;
  extraCuteLine: string;
  theme: AskOutTheme;
  miniGames: AskOutMiniGame[];
  dayQuestion: string;
  dayOptions: DayOption[];
  timeQuestion: string;
}

export interface AskOut extends AskOutContent {
  id: string;
  slug: string;
  status: AskOutStatus;
  createdAt: string;
  updatedAt: string;
  responses: Record<AskOutResponseKind, number>;
  latestResponse?: { response: AskOutResponseKind; selectedDayOption?: string; selectedActivity?: string; respondedAt: string };
}

export const EMPTY_ASK_OUT: AskOutContent = {
  recipientName: "", recipientTag: "", creatorName: "", openingMessage: "", playfulJourney: false, playfulIntensity: "mischievous", recurringJoke: "",
  finalInvitationLine: "", acceptedMessage: "", declineMessage: "",
  interests: [], customInterest: "", date: "", weekday: "", pickupTime: "", endTime: "",
  pickupLocation: "", meetingPoint: "", destination: "", mapAddress: "", activity: "",
  dressCodeJoke: "", specialNote: "", reservationInfo: "", additionalDetails: "",
  extraCuteLine: "", theme: "tagged-message", miniGames: ["notification-tap", "swipe-open", "sticker-peel", "repelling-no"],
  dayQuestion: "When should this highly classified operation occur?", dayOptions: [],
  timeQuestion: "When does the operation begin?",
};
