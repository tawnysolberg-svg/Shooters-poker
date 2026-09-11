import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = readStore();
  return NextResponse.json({ playlist: store.promoPlaylist || [] });
}
