import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/store";
import {
  autoAdvanceIfNeeded,
  getClockSnapshot,
  pauseClock,
  resumeClockWithLevels,
  skipLevel,
  startClock,
} from "@/lib/clock";

export const dynamic = "force-dynamic";

function requireAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get("tournamentId");
  const store = readStore();

  if (tournamentId) {
    let t = store.tournaments.find((x) => x.id === tournamentId);
    if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (t.status === "in_play") {
      const advanced = autoAdvanceIfNeeded(t.clock, t.blindStructure);
      if (JSON.stringify(advanced) !== JSON.stringify(t.clock)) {
        await updateStore((s) => {
          const tt = s.tournaments.find((x) => x.id === tournamentId);
          if (tt) {
            tt.clock = advanced;
            tt.updatedAt = new Date().toISOString();
          }
        });
        t = readStore().tournaments.find((x) => x.id === tournamentId)!;
      }
    }
    return NextResponse.json({
      clock: getClockSnapshot(t),
      tournament: t,
      serverTime: new Date().toISOString(),
    });
  }

  // All in-play clocks
  const clocks = store.tournaments
    .filter((t) => t.status === "in_play")
    .map((t) => ({
      tournamentId: t.id,
      name: t.name,
      clock: getClockSnapshot(t),
      playerCount: t.registrations.filter((r) => r.checkedIn).length || t.registrations.length,
    }));
  return NextResponse.json({ clocks, serverTime: new Date().toISOString() });
}

export async function POST(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { tournamentId, action } = body;
  if (!tournamentId || !action) {
    return NextResponse.json({ error: "tournamentId and action required" }, { status: 400 });
  }

  try {
    const store = await updateStore((s) => {
      const t = s.tournaments.find((x) => x.id === tournamentId);
      if (!t) throw new Error("NOT_FOUND");

      if (action === "start") {
        t.clock = startClock(t.clock, body.levelIndex ?? t.clock.currentLevelIndex);
        t.status = "in_play";
      } else if (action === "pause") {
        t.clock = pauseClock(t.clock, t.blindStructure);
      } else if (action === "resume") {
        t.clock = resumeClockWithLevels(t.clock, t.blindStructure);
        t.status = "in_play";
      } else if (action === "skip") {
        t.clock = skipLevel(t.clock, t.blindStructure);
        t.status = "in_play";
      } else if (action === "setLevel") {
        const idx = Number(body.levelIndex) || 0;
        t.clock = startClock(t.clock, Math.min(idx, t.blindStructure.length - 1));
      } else {
        throw new Error("BAD_ACTION");
      }
      t.updatedAt = new Date().toISOString();
    });

    const t = store.tournaments.find((x) => x.id === tournamentId)!;
    return NextResponse.json({
      ok: true,
      tournament: t,
      clock: getClockSnapshot(t),
      serverTime: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (msg === "BAD_ACTION") return NextResponse.json({ error: "Bad action" }, { status: 400 });
    throw e;
  }
}
