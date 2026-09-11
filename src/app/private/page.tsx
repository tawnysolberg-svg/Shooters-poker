"use client";

import Link from "next/link";
import { useStore } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatMoney } from "@/lib/format";

export default function PrivateGamesPage() {
  const { data, loading } = useStore(4000);

  if (loading && !data) {
    return <div className="h-40 animate-pulse rounded-2xl bg-charcoal-mid" />;
  }
  if (!data) return null;

  const games = [...data.privateGames]
    .filter((g) => g.status !== "cancelled")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Private Games</h1>
        <p className="mt-1 text-sm text-cream-muted">
          Booked tables at Shooters — not on the public cash floor
        </p>
      </div>

      <Link href="/book" className="btn-primary w-full text-center">
        Book a private table
      </Link>

      <div className="space-y-3">
        {games.map((g) => {
          const openSeats = Math.max(0, g.maxPlayers - g.seatedCount);
          const buyIn =
            g.buyInMin === g.buyInMax
              ? formatMoney(g.buyInMin)
              : `${formatMoney(g.buyInMin)}–${formatMoney(g.buyInMax)}`;
          return (
            <div key={g.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-lg text-cream">{g.name}</div>
                  <div className="mt-1 text-sm text-cream-muted">
                    {formatDateTime(g.startAt)} · {g.durationHours}h
                  </div>
                  <div className="mt-1 text-xl font-black text-gold tabular-nums">{g.blinds}</div>
                  <div className="mt-1 text-sm text-cream-muted">
                    {g.gameType} · Buy-in {buyIn}
                  </div>
                  <div className="mt-1 text-sm text-cream-dim">Host: {g.hostName}</div>
                  {g.notes && <div className="mt-2 text-xs text-cream-dim">{g.notes}</div>}
                </div>
                <StatusBadge status={g.status} />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-3xl font-black tabular-nums text-cream">
                    {g.seatedCount}
                    <span className="text-cream-dim text-xl">/{g.maxPlayers}</span>
                  </div>
                  <div className="text-xs text-cream-dim">
                    {openSeats} seat{openSeats === 1 ? "" : "s"} open
                  </div>
                </div>
                <Link
                  href={`/book?game=${encodeURIComponent(g.name)}&type=${encodeURIComponent(g.gameType)}&stakes=${encodeURIComponent(g.blinds)}`}
                  className="btn-secondary text-sm px-4"
                >
                  Request a seat
                </Link>
              </div>
            </div>
          );
        })}
        {games.length === 0 && (
          <p className="text-cream-dim text-sm card">
            No upcoming private games. Book a table and staff will confirm.
          </p>
        )}
      </div>
    </div>
  );
}
