import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";
import { newId, readStore, updateStore } from "@/lib/store";
import type { PrivateGame, PrivateGameStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

function requireAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export async function GET() {
  const store = readStore();
  return NextResponse.json({ privateGames: store.privateGames });
}

export async function POST(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const now = new Date().toISOString();
  const buyInMin = Number(body.buyInMin) || Number(body.buyIn) || 100;
  const buyInMax = Number(body.buyInMax) || buyInMin;
  const game: PrivateGame = {
    id: newId("priv"),
    name: body.name || `Private ${body.gameType || "NLH"}`,
    gameType: body.gameType || "NLH",
    blinds: body.blinds || body.stakes || "$1/$2",
    buyInMin,
    buyInMax,
    startAt: body.startAt
      ? new Date(body.startAt).toISOString()
      : new Date().toISOString(),
    durationHours: Number(body.durationHours) || 4,
    maxPlayers: Number(body.maxPlayers) || 9,
    seatedCount: Number(body.seatedCount) || 0,
    hostName: body.hostName || "Host",
    status: (body.status as PrivateGameStatus) || "open",
    notes: body.notes,
    visibility: "private",
    updatedAt: now,
  };
  const store = await updateStore((s) => {
    s.privateGames.push(game);
  });
  return NextResponse.json({ ok: true, game, privateGames: store.privateGames });
}

export async function PUT(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  try {
    const store = await updateStore((s) => {
      const idx = s.privateGames.findIndex((g) => g.id === body.id);
      if (idx === -1) throw new Error("NOT_FOUND");
      const prev = s.privateGames[idx];
      s.privateGames[idx] = {
        ...prev,
        ...body,
        id: prev.id,
        visibility: "private",
        updatedAt: new Date().toISOString(),
      };
    });
    return NextResponse.json({ ok: true, privateGames: store.privateGames });
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
    s.privateGames = s.privateGames.filter((g) => g.id !== id);
  });
  return NextResponse.json({ ok: true, privateGames: store.privateGames });
}
