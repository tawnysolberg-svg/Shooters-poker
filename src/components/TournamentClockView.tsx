"use client";

import { formatMs } from "@/lib/clock";
import type { ClockSnapshot } from "@/lib/clock";

function formatBlind(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(n);
}

interface Props {
  clock: ClockSnapshot;
  displayMs: number | null;
  flash?: boolean;
  playerCount?: number;
  tournamentName?: string;
  huge?: boolean;
  showNext?: boolean;
}

export function TournamentClockView({
  clock,
  displayMs,
  flash,
  playerCount,
  tournamentName,
  huge,
  showNext = true,
}: Props) {
  const remaining = displayMs ?? clock.remainingMs;
  const cur = clock.current;
  const next = clock.next;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-6 text-center transition-colors ${
        flash
          ? "animate-flash border-gold bg-gold/30"
          : "border-gold/30 bg-felt-dark felt-bg"
      }`}
    >
      {tournamentName && (
        <div className="mb-2 text-sm uppercase tracking-[0.2em] text-gold">{tournamentName}</div>
      )}
      <div className="text-cream-muted text-sm font-semibold uppercase tracking-widest mb-1">
        Level {clock.levelNumber}
        {clock.isPaused && (
          <span className="ml-2 text-amber-300 animate-pulse-gold">PAUSED</span>
        )}
      </div>
      <div
        className={`huge-num leading-none ${huge ? "text-7xl sm:text-9xl" : "text-5xl sm:text-6xl"}`}
      >
        {formatMs(remaining)}
      </div>
      {cur && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-widest text-cream-dim mb-1">Blinds</div>
          <div
            className={`font-display font-black text-cream tabular-nums ${
              huge ? "text-4xl sm:text-6xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {formatBlind(cur.smallBlind)} / {formatBlind(cur.bigBlind)}
            {cur.ante > 0 && (
              <span className="text-gold text-[0.65em]"> · {formatBlind(cur.ante)} ante</span>
            )}
          </div>
        </div>
      )}
      {showNext && next && (
        <div className="mt-3 text-cream-muted text-sm">
          Next: {formatBlind(next.smallBlind)} / {formatBlind(next.bigBlind)}
          {next.ante > 0 ? ` (${formatBlind(next.ante)})` : ""} · {next.durationMinutes}m
        </div>
      )}
      {typeof playerCount === "number" && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-charcoal/60 px-4 py-2 text-cream border border-charcoal-light">
          <span className="text-gold font-bold text-lg tabular-nums">{playerCount}</span>
          <span className="text-xs uppercase tracking-wider text-cream-dim">Players</span>
        </div>
      )}
    </div>
  );
}
