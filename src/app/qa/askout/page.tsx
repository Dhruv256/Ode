import { AskOutExperience } from "@/features/askout/recipient/AskOutExperience";
import { ASK_OUT_THEMES, funnyDayOptions } from "@/features/askout/config";
import type { AskOutContent, AskOutTheme } from "@/features/askout/types";
const themes: AskOutTheme[] = ["tagged-message", "cat-investigation", "magical-message", "scrapbook", "tiny-exhibit"];
export default function AskOutQaPage({ searchParams }: { searchParams: { theme?: string; answer?: string; playful?: string } }) {
  const theme = themes.includes(searchParams.theme as AskOutTheme) ? searchParams.theme as AskOutTheme : "tagged-message";
  const content: AskOutContent & { slug: string } = {
    recipientName: "Anoli", recipientTag: "anoli", creatorName: "Dhruv", openingMessage: "", playfulJourney: searchParams.playful === "1", playfulIntensity: "mischievous", recurringJoke: "",
    finalInvitationLine: "", acceptedMessage: "", declineMessage: "",
    interests: theme === "cat-investigation" ? ["cats", "coffee"] : theme === "scrapbook" ? ["music"] : theme === "tiny-exhibit" ? ["movies", "coffee"] : theme === "magical-message" ? ["wizarding", "fiction-books"] : ["movies"], customInterest: "",
    date: "2027-01-03", weekday: "Sunday", pickupTime: "19:00", endTime: "22:00", pickupLocation: "Your place", meetingPoint: "",
    destination: "The Reading Room", mapAddress: "12 Book Street, Bengaluru", activity: "Bookstore + coffee", dressCodeJoke: "Wear something capable of ordering dessert.", specialNote: "Casual, no speeches.", reservationInfo: "Table under Dhruv", additionalDetails: "It’s casual, about three hours, and transport is sorted. Zero surprise audience.", extraCuteLine: "The tiny planning committee can finally clock out.",
    theme, miniGames: [...ASK_OUT_THEMES[theme].interactions],
    dayQuestion: "When should this highly classified operation occur?", dayOptions: funnyDayOptions("Sunday",0,theme), timeQuestion: "When does the operation begin?", slug: "anoli-x7k2",
  };
  return <AskOutExperience content={content} />;
}
