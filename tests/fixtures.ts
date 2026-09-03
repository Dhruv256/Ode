import type { Hamper, HamperItem, ItemPayloads, ItemType } from "../src/features/hamper/types";
export const payloads: ItemPayloads = {
  note: { title: "A little reminder", body: "You make the ordinary days feel special.\nHere is a little care, just for you." },
  photo: { assetId: "c1111111-1111-4111-8111-111111111111", caption: "That lovely afternoon" },
  song: { url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT", title: "Our Sunday song" },
  video: { url: "https://youtu.be/dQw4w9WgXcQ", caption: "A tiny time capsule" },
  voice: { assetId: "c2222222-2222-4222-8222-222222222222", title: "A familiar hello" },
  drawing: { caption: "A little flower", strokes: [{ color: "#a43d50", width: 9, points: [[490,400],[400,250],[490,310],[530,190],[560,310],[670,240],[590,400],[490,400]] }, { color: "#59683b", width: 9, points: [[540,400],[530,560],[450,500]] }] },
  gift: { url: "https://example.com/gift", note: "A little something for your next adventure." },
  location: { place: "Our favourite corner", url: "https://www.google.com/maps", note: "Same time next Sunday?" },
  coupon: { title: "One coffee on me", description: "Good for a long conversation, too.", code: "COFFEE", expiry: "2027-12-31" },
  news: { url: "https://example.com/article", headline: "Something worth a slow read", note: "Thought you would love this." },
};
export function fixtureItem(type: ItemType, index = 0): HamperItem {
  return { id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, type, position: index, payload: structuredClone(payloads[type]), assetBytes: 0 } as HamperItem;
}
export function fixtureHamper(): Hamper {
  return { id: "b0000000-0000-4000-8000-000000000001", recipient: "Ananya", sender: "Dhruv", message: "For all the little ways you make life lovely.", theme: "soft-parcel", openingStyle: "burst", status: "draft", hasPin: false, createdAt: "2026-09-03T00:00:00.000Z", updatedAt: "2026-09-03T00:00:00.000Z", views: 0, opened: 0,
    links: [{ id: "d0000000-0000-4000-8000-000000000001", slug: "for-ananya-test", is_primary: true, revoked_at: null, created_at: "2026-09-03T00:00:00.000Z" }],
    items: (Object.keys(payloads) as ItemType[]).map((type, index) => fixtureItem(type, index)),
  };
}
