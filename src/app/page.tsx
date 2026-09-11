"use client";

import Link from "next/link";
import { useStore } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBlinds, formatMoney, formatTime, isSameDay } from "@/lib/format";
import { TournamentClockView } from "@/components/TournamentClockView";
import { useClock } from "@/lib/hooks";
import { getClockSnapshot } from "@/lib/clock";

export default function TodayPage() {
  const { data, loading, error } = useStore(4000);
  const liveTourney = data?.tournaments.find((t) => t.status === "in_play");
  const { clock, displayMs, flash } = useClock(liveTourney?.id ?? null, 1000);

  if (loading && !data) {
    return <Loading />;
  }
  if (error && !data) {
    return <p className="text-red-300">{error}</p>;
  }
  if (!data) return null;

  const openCash = data.cashGames.filter((g) => g.status !== "closed");
  const todayTourneys = data.tournaments.filter(
    (t) => isSameDay(t.startTime) || t.status === "in_play" || t.status === "late_reg"
  );
  const waitingCount = data.waitlist.filter((w) => w.status === "waiting").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Today at Shooters</h1>
        <p className="mt-1 text-cream-muted text-sm">
          Live tables · waitlist · tournaments
        </p>
      </div>

      {liveTourney && clock && (
        <Link href={`/tournaments/${liveTourney.id}`} className="block">
          <TournamentClockView
            clock={clock}
            displayMs={displayMs}
            flash={flash}
            tournamentName={liveTourney.name}
            playerCount={
              liveTourney.registrations.filter((r) => r.checkedIn).length ||
              liveTourney.registrations.length
            }
          />
        </Link>
      )}

      <section className="grid grid-cols-3 gap-2">
        <Stat label="Cash tables" value={String(openCash.length)} />
        <Stat label="On waitlist" value={String(waitingCount)} />
        <Stat label="Tourneys" value={String(todayTourneys.length)} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-cream">Cash Games</h2>
          <Link href="/cash" className="text-sm text-gold font-semibold">
            All tables →
          </Link>
        </div>
        <div className="space-y-3">
          {openCash.map((g) => (
            <Link key={g.id} href="/cash" className="card block active:scale-[0.99] transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-cream">{g.name}</div>
                  <div className="mt-1 text-gold font-semibold">
                    {formatBlinds(g.smallBlind, g.bigBlind)}
                  </div>
                  <div className="mt-1 text-sm text-cream-muted">
                    Buy-in {formatMoney(g.buyInMin)}–{formatMoney(g.buyInMax)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={g.status} />
                  <div className="mt-2 text-lg font-bold tabular-nums text-cream">
                    {g.seatedCount}/{g.maxSeats}
                  </div>
                  <div className="text-xs text-cream-dim">
                    {Math.max(0, g.maxSeats - g.seatedCount)} open
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {openCash.length === 0 && (
            <p className="text-cream-dim text-sm">No cash games open right now.</p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-cream">Tournaments</h2>
          <Link href="/tournaments" className="text-sm text-gold font-semibold">
            All →
          </Link>
        </div>
        <div className="space-y-3">
          {todayTourneys.map((t) => {
            const snap = getClockSnapshot(t);
            return (
              <Link
                key={t.id}
                href={`/tournaments/${t.id}`}
                className="card block active:scale-[0.99] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-cream">{t.name}</div>
                    <div className="mt-1 text-sm text-cream-muted">
                      {t.gameType} · {formatMoney(t.buyIn + t.fee)} · {formatTime(t.startTime)}
                    </div>
                    <div className="mt-1 text-sm text-cream-dim">
                      {t.registrations.length} registered
                      {t.status === "in_play" && snap
                        ? ` · L${snap.levelNumber} ${snap.remainingDisplay}`
                        : ""}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/waitlist" className="btn-primary text-center">
          Join Waitlist
        </Link>
        <Link href="/check-in" className="btn-secondary text-center">
          Check In
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card text-center py-3">
      <div className="text-2xl font-black text-gold tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-cream-dim mt-0.5">{label}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-charcoal-light" />
      <div className="h-40 rounded-2xl bg-charcoal-mid" />
      <div className="h-24 rounded-2xl bg-charcoal-mid" />
    </div>
  );
}
