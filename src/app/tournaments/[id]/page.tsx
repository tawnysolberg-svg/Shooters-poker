"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useClock } from "@/lib/hooks";
import { TournamentClockView } from "@/components/TournamentClockView";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Tournament } from "@/lib/types";

export default function TournamentDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { clock, displayMs, flash, tournament: liveT } = useClock(
    tournament?.status === "in_play" ? id : null,
    1000
  );

  async function load() {
    const res = await fetch(`/api/tournaments?id=${id}`, { cache: "no-store" });
    if (!res.ok) {
      setError("Tournament not found");
      return;
    }
    const json = await res.json();
    setTournament(json.tournament);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (liveT) setTournament(liveT);
  }, [liveT]);

  async function register(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          tournamentId: id,
          playerName: name.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setTournament(json.tournament);
      setMsg(`Registered as ${name.trim()}`);
      setName("");
      setPhone("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function unregister(registrationId: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unregister",
          tournamentId: id,
          registrationId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setTournament(json.tournament);
      setMsg("Unregistered");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-300">{error}</p>
        <Link href="/tournaments" className="btn-secondary">
          Back
        </Link>
      </div>
    );
  }
  if (!tournament) {
    return <div className="h-40 animate-pulse rounded-2xl bg-charcoal-mid" />;
  }

  const canRegister = ["registering", "late_reg"].includes(tournament.status);
  const checkedIn = tournament.registrations.filter((r) => r.checkedIn).length;
  const displayClock = clock;

  return (
    <div className="space-y-5">
      <Link href="/tournaments" className="text-sm text-gold font-semibold">
        ← Tournaments
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">{tournament.name}</h1>
          <p className="mt-1 text-cream-muted text-sm">
            {tournament.gameType} · {formatDateTime(tournament.startTime)}
          </p>
        </div>
        <StatusBadge status={tournament.status} />
      </div>

      <div className="card grid grid-cols-2 gap-3 text-center">
        <div>
          <div className="text-2xl font-black text-gold tabular-nums">
            {formatMoney(tournament.buyIn + tournament.fee)}
          </div>
          <div className="text-xs text-cream-dim uppercase tracking-wider">Total buy-in</div>
        </div>
        <div>
          <div className="text-2xl font-black text-cream tabular-nums">
            {tournament.registrations.length}/{tournament.maxPlayers}
          </div>
          <div className="text-xs text-cream-dim uppercase tracking-wider">Registered</div>
        </div>
        <div>
          <div className="text-2xl font-black text-cream tabular-nums">{checkedIn}</div>
          <div className="text-xs text-cream-dim uppercase tracking-wider">Checked in</div>
        </div>
        <div>
          <div className="text-2xl font-black text-cream tabular-nums">
            L{tournament.lateRegUntilLevel}
          </div>
          <div className="text-xs text-cream-dim uppercase tracking-wider">Late reg thru</div>
        </div>
      </div>

      {tournament.status === "in_play" && displayClock && (
        <div>
          <TournamentClockView
            clock={displayClock}
            displayMs={displayMs}
            flash={flash}
            playerCount={checkedIn || tournament.registrations.length}
            huge
          />
          <Link href="/tv" className="mt-2 block text-center text-sm text-gold">
            Open TV display →
          </Link>
        </div>
      )}

      {tournament.notes && (
        <p className="text-sm text-cream-muted">{tournament.notes}</p>
      )}

      {msg && (
        <div className="rounded-xl bg-felt-mid border border-felt-light px-4 py-3 text-sm">{msg}</div>
      )}

      {canRegister && (
        <form onSubmit={register} className="card space-y-3 border-gold/20">
          <h2 className="font-bold text-cream">Register</h2>
          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
          />
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Registering…" : "Register"}
          </button>
        </form>
      )}

      <section className="card">
        <h2 className="font-bold text-cream mb-3">
          Players ({tournament.registrations.length})
        </h2>
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {tournament.registrations.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-charcoal px-3 py-2.5 border border-charcoal-light"
            >
              <div>
                <div className="font-medium text-cream">
                  {r.playerName}
                  {r.checkedIn && (
                    <span className="ml-2 text-xs text-emerald-300 font-bold">✓ IN</span>
                  )}
                </div>
                {r.phone && <div className="text-xs text-cream-dim">{r.phone}</div>}
              </div>
              {canRegister && (
                <button
                  type="button"
                  className="text-xs text-red-300 font-semibold min-h-[44px] px-2"
                  disabled={busy}
                  onClick={() => unregister(r.id)}
                >
                  Unregister
                </button>
              )}
            </li>
          ))}
          {tournament.registrations.length === 0 && (
            <li className="text-sm text-cream-dim">No registrations yet</li>
          )}
        </ul>
      </section>

      <section className="card">
        <h2 className="font-bold text-cream mb-3">Blind structure</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-cream-dim text-xs uppercase">
              <tr>
                <th className="py-2 pr-2">Lvl</th>
                <th className="py-2 pr-2">Blinds</th>
                <th className="py-2 pr-2">Ante</th>
                <th className="py-2">Min</th>
              </tr>
            </thead>
            <tbody>
              {tournament.blindStructure.map((l, i) => (
                <tr
                  key={l.level}
                  className={`border-t border-charcoal-light ${
                    tournament.status === "in_play" &&
                    tournament.clock.currentLevelIndex === i
                      ? "text-gold font-bold"
                      : "text-cream"
                  }`}
                >
                  <td className="py-2 pr-2">{l.level}</td>
                  <td className="py-2 pr-2 tabular-nums">
                    {l.smallBlind}/{l.bigBlind}
                  </td>
                  <td className="py-2 pr-2 tabular-nums">{l.ante || "—"}</td>
                  <td className="py-2">{l.durationMinutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
