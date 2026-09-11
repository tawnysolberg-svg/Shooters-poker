"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function BookForm() {
  const search = useSearchParams();
  const defaults = useMemo(
    () => ({
      gameType: search.get("type") || "NLH",
      stakes: search.get("stakes") || "$1/$2",
      notes: search.get("game") ? `Seat request for: ${search.get("game")}` : "",
    }),
    [search]
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [gameType, setGameType] = useState(defaults.gameType);
  const [stakes, setStakes] = useState(defaults.stakes);
  const [buyIn, setBuyIn] = useState("300");
  const [playerCount, setPlayerCount] = useState("8");
  const [notes, setNotes] = useState(defaults.notes);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const start = date && time ? new Date(`${date}T${time}:00`) : new Date();
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          requestedStartAt: start.toISOString(),
          gameType: gameType.trim(),
          stakes: stakes.trim(),
          buyIn: Number(buyIn) || 100,
          playerCount: Number(playerCount) || 6,
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="page-title">Request sent</h1>
          <p className="mt-1 text-sm text-cream-muted">Shooters Poker Room</p>
        </div>
        <div className="card border-gold/30 space-y-3">
          <p className="text-cream font-semibold">
            Thanks, {name}! Your private table request is pending.
          </p>
          <p className="text-sm text-cream-muted">
            Staff will confirm by phone ({phone}). You can check Private games for
            upcoming booked tables.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/private" className="btn-secondary text-center">
            Private games
          </Link>
          <Link href="/" className="btn-primary text-center">
            Today
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Book a Table</h1>
        <p className="mt-1 text-sm text-cream-muted">
          Request a private game at Shooters Poker Room
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/40 border border-red-700/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="card space-y-4 border-gold/20">
        <div>
          <label className="label" htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone *
          </label>
          <input
            id="phone"
            className="input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="555-0100"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="date">
              Date *
            </label>
            <input
              id="date"
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="time">
              Time *
            </label>
            <input
              id="time"
              className="input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="gameType">
            Game type *
          </label>
          <select
            id="gameType"
            className="input"
            value={gameType}
            onChange={(e) => setGameType(e.target.value)}
          >
            <option value="NLH">NLH</option>
            <option value="PLO">PLO</option>
            <option value="PLO-8">PLO-8</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="stakes">
            Blinds / stakes *
          </label>
          <input
            id="stakes"
            className="input"
            value={stakes}
            onChange={(e) => setStakes(e.target.value)}
            placeholder="$1/$2 or $2/$5"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="buyIn">
              Buy-in ($) *
            </label>
            <input
              id="buyIn"
              className="input"
              type="number"
              min={20}
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="playerCount">
              Players *
            </label>
            <input
              id="playerCount"
              className="input"
              type="number"
              min={2}
              max={10}
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            className="input min-h-[96px] py-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Occasion, preferred room, flexibility…"
            rows={3}
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Submitting…" : "Submit request"}
        </button>
      </form>

      <Link href="/private" className="btn-ghost w-full text-center">
        ← Back to private games
      </Link>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-charcoal-mid" />}>
      <BookForm />
    </Suspense>
  );
}
