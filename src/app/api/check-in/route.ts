import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const tournamentId = searchParams.get("tournamentId");
  const store = readStore();

  const results: Array<{
    registrationId: string;
    tournamentId: string;
    tournamentName: string;
    playerName: string;
    phone?: string;
    checkedIn: boolean;
  }> = [];

  for (const t of store.tournaments) {
    if (tournamentId && t.id !== tournamentId) continue;
    if (!["registering", "late_reg", "in_play"].includes(t.status)) continue;
    for (const r of t.registrations) {
      if (q && !r.playerName.toLowerCase().includes(q) && !(r.phone || "").includes(q)) {
        continue;
      }
      results.push({
        registrationId: r.id,
        tournamentId: t.id,
        tournamentName: t.name,
        playerName: r.playerName,
        phone: r.phone,
        checkedIn: r.checkedIn,
      });
    }
  }

  results.sort((a, b) => a.playerName.localeCompare(b.playerName));
  return NextResponse.json({ results, tournaments: store.tournaments.map((t) => ({ id: t.id, name: t.name, status: t.status })) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { tournamentId, registrationId, checkedIn = true } = body;
  if (!tournamentId || !registrationId) {
    return NextResponse.json({ error: "tournamentId and registrationId required" }, { status: 400 });
  }
  try {
    const store = await updateStore((s) => {
      const t = s.tournaments.find((x) => x.id === tournamentId);
      if (!t) throw new Error("NOT_FOUND");
      const r = t.registrations.find((x) => x.id === registrationId);
      if (!r) throw new Error("REG_NOT_FOUND");
      r.checkedIn = Boolean(checkedIn);
      r.checkedInAt = checkedIn ? new Date().toISOString() : undefined;
      t.updatedAt = new Date().toISOString();
    });
    const t = store.tournaments.find((x) => x.id === tournamentId)!;
    return NextResponse.json({ ok: true, tournament: t });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND" || msg === "REG_NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw e;
  }
}
