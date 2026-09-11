import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";
import { newId, readStore, updateStore } from "@/lib/store";
import { autoAdvanceIfNeeded, getClockSnapshot } from "@/lib/clock";
import type { BlindLevel, Tournament, TournamentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function requireAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

function defaultBlinds(): BlindLevel[] {
  return [
    { level: 1, smallBlind: 100, bigBlind: 200, ante: 0, durationMinutes: 20 },
    { level: 2, smallBlind: 200, bigBlind: 400, ante: 0, durationMinutes: 20 },
    { level: 3, smallBlind: 300, bigBlind: 600, ante: 100, durationMinutes: 20 },
    { level: 4, smallBlind: 400, bigBlind: 800, ante: 100, durationMinutes: 20 },
    { level: 5, smallBlind: 500, bigBlind: 1000, ante: 100, durationMinutes: 20 },
    { level: 6, smallBlind: 600, bigBlind: 1200, ante: 200, durationMinutes: 15 },
    { level: 7, smallBlind: 800, bigBlind: 1600, ante: 200, durationMinutes: 15 },
    { level: 8, smallBlind: 1000, bigBlind: 2000, ante: 300, durationMinutes: 15 },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  let store = readStore();

  // Auto-advance clocks that have elapsed
  let dirty = false;
  store = await updateStore((s) => {
    for (const t of s.tournaments) {
      if (t.status === "in_play" && t.clock.isRunning) {
        const advanced = autoAdvanceIfNeeded(t.clock, t.blindStructure);
        if (JSON.stringify(advanced) !== JSON.stringify(t.clock)) {
          t.clock = advanced;
          t.updatedAt = new Date().toISOString();
          dirty = true;
        }
      }
    }
  });

  if (id) {
    const tournament = store.tournaments.find((t) => t.id === id);
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      tournament,
      clock: getClockSnapshot(tournament),
      serverTime: new Date().toISOString(),
    });
  }

  const tournaments = store.tournaments.map((t) => ({
    ...t,
    clockSnapshot: getClockSnapshot(t),
  }));
  return NextResponse.json({ tournaments, serverTime: new Date().toISOString(), dirty });
}

export async function POST(request: Request) {
  const body = await request.json();
  const action = body.action as string | undefined;

  // Player registration
  if (action === "register") {
    const { tournamentId, playerName, phone } = body;
    const name = String(playerName || "").trim();
    if (!tournamentId || !name) {
      return NextResponse.json({ error: "tournamentId and playerName required" }, { status: 400 });
    }
    try {
      const store = await updateStore((s) => {
        const t = s.tournaments.find((x) => x.id === tournamentId);
        if (!t) throw new Error("NOT_FOUND");
        if (!["registering", "late_reg"].includes(t.status)) throw new Error("CLOSED");
        if (t.registrations.length >= t.maxPlayers) throw new Error("FULL");
        if (t.registrations.some((r) => r.playerName.toLowerCase() === name.toLowerCase())) {
          throw new Error("DUPLICATE");
        }
        t.registrations.push({
          id: newId("reg"),
          playerName: name,
          phone: phone ? String(phone).trim() : undefined,
          registeredAt: new Date().toISOString(),
          checkedIn: false,
        });
        t.updatedAt = new Date().toISOString();
      });
      const tournament = store.tournaments.find((t) => t.id === tournamentId)!;
      return NextResponse.json({ ok: true, tournament });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (msg === "CLOSED") return NextResponse.json({ error: "Registration closed" }, { status: 400 });
      if (msg === "FULL") return NextResponse.json({ error: "Tournament full" }, { status: 400 });
      if (msg === "DUPLICATE") return NextResponse.json({ error: "Already registered" }, { status: 400 });
      throw e;
    }
  }

  if (action === "unregister") {
    const { tournamentId, registrationId, playerName } = body;
    const store = await updateStore((s) => {
      const t = s.tournaments.find((x) => x.id === tournamentId);
      if (!t) throw new Error("NOT_FOUND");
      if (!["registering", "late_reg"].includes(t.status)) throw new Error("CLOSED");
      t.registrations = t.registrations.filter((r) => {
        if (registrationId) return r.id !== registrationId;
        if (playerName) return r.playerName.toLowerCase() !== String(playerName).toLowerCase();
        return true;
      });
      t.updatedAt = new Date().toISOString();
    }).catch((e) => {
      if (e.message === "NOT_FOUND") return null;
      if (e.message === "CLOSED") return "CLOSED" as unknown as ReturnType<typeof readStore>;
      throw e;
    });
    if (store === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if ((store as unknown) === "CLOSED") {
      return NextResponse.json({ error: "Registration closed" }, { status: 400 });
    }
    const tournament = store.tournaments.find((t) => t.id === tournamentId)!;
    return NextResponse.json({ ok: true, tournament });
  }

  // Admin create
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const tournament: Tournament = {
    id: newId("tny"),
    name: body.name || "New Tournament",
    gameType: body.gameType || "NLH",
    buyIn: Number(body.buyIn) || 100,
    fee: Number(body.fee) || 20,
    startTime: body.startTime || now,
    maxPlayers: Number(body.maxPlayers) || 60,
    status: (body.status as TournamentStatus) || "registering",
    blindStructure: body.blindStructure || defaultBlinds(),
    lateRegUntilLevel: Number(body.lateRegUntilLevel) || 5,
    clock: {
      currentLevelIndex: 0,
      levelStartedAt: null,
      pausedAt: null,
      pausedRemainingMs: null,
      isRunning: false,
    },
    registrations: [],
    notes: body.notes,
    updatedAt: now,
  };
  const store = await updateStore((s) => {
    s.tournaments.push(tournament);
  });
  return NextResponse.json({ ok: true, tournament, tournaments: store.tournaments });
}

export async function PUT(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    const store = await updateStore((s) => {
      const idx = s.tournaments.findIndex((t) => t.id === body.id);
      if (idx === -1) throw new Error("NOT_FOUND");
      const rest = { ...body };
      delete rest.action;
      delete rest.clockAction;
      s.tournaments[idx] = {
        ...s.tournaments[idx],
        ...rest,
        id: s.tournaments[idx].id,
        registrations: rest.registrations ?? s.tournaments[idx].registrations,
        clock: rest.clock ?? s.tournaments[idx].clock,
        updatedAt: new Date().toISOString(),
      };
    });
    return NextResponse.json({ ok: true, tournaments: store.tournaments });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await updateStore((s) => {
    s.tournaments = s.tournaments.filter((t) => t.id !== id);
  });
  return NextResponse.json({ ok: true, tournaments: store.tournaments });
}
