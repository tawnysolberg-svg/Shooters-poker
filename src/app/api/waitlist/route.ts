import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";
import { newId, readStore, updateStore } from "@/lib/store";

export const dynamic = "force-dynamic";

function requireAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  const store = readStore();
  let waitlist = store.waitlist.filter((w) => w.status === "waiting");
  if (gameId) waitlist = waitlist.filter((w) => w.cashGameId === gameId);
  waitlist.sort((a, b) => a.position - b.position);
  return NextResponse.json({ waitlist, cashGames: store.cashGames });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body?.name || "").trim();
  const cashGameId = String(body?.cashGameId || "");
  if (!name || !cashGameId) {
    return NextResponse.json({ error: "name and cashGameId required" }, { status: 400 });
  }
  try {
    const store = await updateStore((s) => {
      const game = s.cashGames.find((g) => g.id === cashGameId);
      if (!game) throw new Error("GAME_NOT_FOUND");
      if (game.status === "closed") throw new Error("GAME_CLOSED");
      const existing = s.waitlist.filter(
        (w) => w.cashGameId === cashGameId && w.status === "waiting"
      );
      const position = existing.length + 1;
      s.waitlist.push({
        id: newId("wl"),
        cashGameId,
        name,
        phone: body.phone ? String(body.phone).trim() : undefined,
        position,
        status: "waiting",
        joinedAt: new Date().toISOString(),
      });
    });
    return NextResponse.json({ ok: true, waitlist: store.waitlist, version: store.version });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "GAME_NOT_FOUND") return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (msg === "GAME_CLOSED") return NextResponse.json({ error: "Game is closed" }, { status: 400 });
    throw e;
  }
}

export async function PUT(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { id, action } = body;
  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }
  try {
    const store = await updateStore((s) => {
      const entry = s.waitlist.find((w) => w.id === id);
      if (!entry) throw new Error("NOT_FOUND");

      if (action === "seat") {
        entry.status = "seated";
        const game = s.cashGames.find((g) => g.id === entry.cashGameId);
        if (game && game.seatedCount < game.maxSeats) {
          game.seatedCount += 1;
          if (game.seatedCount >= game.maxSeats) game.status = "full";
          game.updatedAt = new Date().toISOString();
        }
      } else if (action === "skip") {
        entry.status = "skipped";
      } else if (action === "remove") {
        entry.status = "removed";
      } else {
        throw new Error("BAD_ACTION");
      }

      const waiting = s.waitlist
        .filter((w) => w.cashGameId === entry.cashGameId && w.status === "waiting")
        .sort((a, b) => a.position - b.position);
      waiting.forEach((w, i) => {
        w.position = i + 1;
      });
    });
    return NextResponse.json({ ok: true, waitlist: store.waitlist, cashGames: store.cashGames });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (msg === "BAD_ACTION") return NextResponse.json({ error: "Bad action" }, { status: 400 });
    throw e;
  }
}
