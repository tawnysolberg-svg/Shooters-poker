import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";
import { newId, readStore, updateStore } from "@/lib/store";
import type { BookingRequest, PrivateGame } from "@/lib/types";

export const dynamic = "force-dynamic";

function requireAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export async function GET() {
  const store = readStore();
  return NextResponse.json({ bookings: store.bookings });
}

/** Public: create a pending booking request. */
export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body?.name || "").trim();
  const phone = String(body?.phone || "").trim();
  if (!name || !phone) {
    return NextResponse.json({ error: "name and phone required" }, { status: 400 });
  }
  const requestedStartAt = body.requestedStartAt
    ? new Date(body.requestedStartAt).toISOString()
    : new Date().toISOString();
  const booking: BookingRequest = {
    id: newId("book"),
    name,
    phone,
    requestedStartAt,
    gameType: String(body.gameType || "NLH").trim() || "NLH",
    stakes: String(body.stakes || body.blinds || "").trim() || "$1/$2",
    buyIn: Number(body.buyIn) || 100,
    playerCount: Math.max(2, Number(body.playerCount) || 6),
    notes: body.notes ? String(body.notes).trim() : undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const store = await updateStore((s) => {
    s.bookings.unshift(booking);
  });
  return NextResponse.json({ ok: true, booking, bookings: store.bookings });
}

/**
 * Admin: confirm / decline / update.
 * Confirm creates or links a private game and marks booking confirmed.
 */
export async function PUT(request: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { id, action } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    let linkedGame: PrivateGame | null = null;
    const store = await updateStore((s) => {
      const booking = s.bookings.find((b) => b.id === id);
      if (!booking) throw new Error("NOT_FOUND");

      if (action === "confirm") {
        booking.status = "confirmed";
        if (body.staffNote) booking.staffNote = String(body.staffNote);
        if (body.privateGameId) {
          const existing = s.privateGames.find((g) => g.id === body.privateGameId);
          if (!existing) throw new Error("GAME_NOT_FOUND");
          booking.privateGameId = existing.id;
          linkedGame = existing;
        } else if (!booking.privateGameId) {
          const now = new Date().toISOString();
          const game: PrivateGame = {
            id: newId("priv"),
            name: body.gameName || `${booking.name}'s Private ${booking.gameType}`,
            gameType: booking.gameType,
            blinds: booking.stakes,
            buyInMin: booking.buyIn,
            buyInMax: booking.buyIn,
            startAt: booking.requestedStartAt,
            durationHours: Number(body.durationHours) || 4,
            maxPlayers: booking.playerCount,
            seatedCount: 0,
            hostName: booking.name,
            status: "confirmed",
            notes: booking.notes,
            visibility: "private",
            updatedAt: now,
          };
          s.privateGames.push(game);
          booking.privateGameId = game.id;
          linkedGame = game;
        }
      } else if (action === "decline") {
        booking.status = "declined";
        if (body.staffNote) booking.staffNote = String(body.staffNote);
      } else if (action === "update") {
        if (body.status) booking.status = body.status;
        if (body.staffNote !== undefined) booking.staffNote = body.staffNote;
        if (body.privateGameId !== undefined) booking.privateGameId = body.privateGameId;
      } else {
        throw new Error("BAD_ACTION");
      }
    });
    return NextResponse.json({
      ok: true,
      bookings: store.bookings,
      privateGames: store.privateGames,
      linkedGame,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (msg === "GAME_NOT_FOUND")
      return NextResponse.json({ error: "Private game not found" }, { status: 404 });
    if (msg === "BAD_ACTION") return NextResponse.json({ error: "Bad action" }, { status: 400 });
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
    s.bookings = s.bookings.filter((b) => b.id !== id);
  });
  return NextResponse.json({ ok: true, bookings: store.bookings });
}
