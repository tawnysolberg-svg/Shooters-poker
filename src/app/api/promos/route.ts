import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/store";
import type { PromoItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_PLAYLIST: PromoItem[] = [
  {
    id: "promo_flyer_schedule",
    type: "image",
    url: "/promos/weekly-schedule.png",
    title: "Weekly Schedule",
    durationSeconds: 15,
  },
  {
    id: "promo_flyer_tv",
    type: "image",
    url: "/promos/tv-tournament.png",
    title: "TV Tournament",
    durationSeconds: 15,
  },
  {
    id: "promo_welcome",
    type: "slide",
    title: "Shooters Poker Room",
    subtitle: "Montana · Big Sky Country",
    body: "Cash · Tournaments · Private Games",
    durationSeconds: 10,
  },
  {
    id: "promo_private",
    type: "slide",
    title: "Book a Private Table",
    subtitle: "Any day · Reserve in the app",
    body: "shooters-poker.vercel.app/book",
    durationSeconds: 12,
  },
  {
    id: "promo_comps",
    type: "slide",
    title: "Player Comps",
    subtitle: "On us",
    body: "Free soda · Free snacks · Free pizza",
    durationSeconds: 10,
  },
];

export async function GET() {
  const store = readStore();
  let playlist = store.promoPlaylist || [];
  const hasFlyers = playlist.some(
    (p) => p.type === "image" && p.url?.includes("/promos/")
  );
  if (!playlist.length || !hasFlyers) {
    playlist = DEFAULT_PLAYLIST;
    // Persist when possible (local/persistent hosts); ignore failures on ephemeral FS
    try {
      await updateStore((s) => {
        s.promoPlaylist = DEFAULT_PLAYLIST;
      });
    } catch {
      /* ignore */
    }
  }
  return NextResponse.json({ playlist });
}
