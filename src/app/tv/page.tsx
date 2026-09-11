"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useClock } from "@/lib/hooks";
import { TournamentClockView } from "@/components/TournamentClockView";
import type { Tournament } from "@/lib/types";

export default function TvPage() {
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const { clock, displayMs, flash, tournament } = useClock(tournamentId, 1000);

  useEffect(() => {
    async function find() {
      const res = await fetch("/api/clock", { cache: "no-store" });
      const json = await res.json();
      if (json.clocks?.length) {
        setTournamentId(json.clocks[0].tournamentId);
        setName(json.clocks[0].name);
      } else {
        // fallback: any in-play from store
        const s = await fetch("/api/store", { cache: "no-store" });
        const store = await s.json();
        const live = (store.tournaments as Tournament[]).find((t) => t.status === "in_play");
        if (live) {
          setTournamentId(live.id);
          setName(live.name);
        }
      }
    }
    find();
    const id = setInterval(find, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (tournament) setName(tournament.name);
  }, [tournament]);

  const playerCount = tournament
    ? tournament.registrations.filter((r) => r.checkedIn).length ||
      tournament.registrations.length
    : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-felt-dark felt-bg flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="mb-4 text-center">
        <div className="text-gold text-sm uppercase tracking-[0.35em] font-bold">
          Shooters Poker Room
        </div>
      </div>
      {!clock ? (
        <div className="text-center space-y-6">
          <div className="text-cream-muted text-xl">No tournament in play</div>
          <Link href="/tv/promos" className="inline-block text-gold text-lg hover:underline">
            Open promo loop
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <TournamentClockView
            clock={clock}
            displayMs={displayMs}
            flash={flash}
            tournamentName={name}
            playerCount={playerCount}
            huge
          />
        </div>
      )}
    </div>
  );
}
