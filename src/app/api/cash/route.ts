import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";
import { newId, readStore, updateStore } from "@/lib/store";
import type { CashGame, GameStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function requireAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export async function GET() {
  const store = readStore();
  return NextResponse.json({ cashGames: store.cashGames });
}

export async function POST(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const now = new Date().toISOString();
  const game: CashGame = {
    id: newId("cash"),
    name: body.name || `${body.smallBlind}/${body.bigBlind} ${body.gameType}`,
    gameType: body.gameType || "NLH",
    smallBlind: Number(body.smallBlind) || 1,
    bigBlind: Number(body.bigBlind) || 2,
    buyInMin: Number(body.buyInMin) || 100,
    buyInMax: Number(body.buyInMax) || 300,
    maxSeats: Number(body.maxSeats) || 9,
    seatedCount: Number(body.seatedCount) || 0,
    status: (body.status as GameStatus) || "open",
    tableNumber: body.tableNumber ? Number(body.tableNumber) : undefined,
    notes: body.notes,
    updatedAt: now,
  };
  const store = await updateStore((s) => {
    s.cashGames.push(game);
  });
  return NextResponse.json({ ok: true, game, cashGames: store.cashGames });
}

export async function PUT(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const store = await updateStore((s) => {
    const idx = s.cashGames.findIndex((g) => g.id === body.id);
    if (idx === -1) throw new Error("NOT_FOUND");
    s.cashGames[idx] = {
      ...s.cashGames[idx],
      ...body,
      id: s.cashGames[idx].id,
      updatedAt: new Date().toISOString(),
    };
  }).catch((e) => {
    if (e.message === "NOT_FOUND") return null;
    throw e;
  });
  if (!store) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, cashGames: store.cashGames });
}

export async function DELETE(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const store = await updateStore((s) => {
    s.cashGames = s.cashGames.filter((g) => g.id !== id);
    s.waitlist = s.waitlist.filter((w) => w.cashGameId !== id);
  });
  return NextResponse.json({ ok: true, cashGames: store.cashGames });
}
