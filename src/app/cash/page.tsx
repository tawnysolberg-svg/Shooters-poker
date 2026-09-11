"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBlinds, formatMoney } from "@/lib/format";

export default function CashPage() {
  const { data, loading, refresh } = useStore(3000);
  const [joinGameId, setJoinGameId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!joinGameId || !name.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cashGameId: joinGameId, name: name.trim(), phone: phone.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg("You're on the waitlist!");
      setName("");
      setPhone("");
      setJoinGameId(null);
      refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return <div className="h-40 animate-pulse rounded-2xl bg-charcoal-mid" />;
  }
  if (!data) return null;

  const games = [...data.cashGames].sort((a, b) => {
    const order = { open: 0, full: 1, closed: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const waitCounts = data.waitlist
    .filter((w) => w.status === "waiting")
    .reduce<Record<string, number>>((acc, w) => {
      acc[w.cashGameId] = (acc[w.cashGameId] || 0) + 1;
      return acc;
    }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Cash Games</h1>
        <p className="mt-1 text-sm text-cream-muted">Live tables at Shooters Poker Room</p>
      </div>

      {msg && (
        <div className="rounded-xl bg-felt-mid border border-felt-light px-4 py-3 text-sm text-cream">
          {msg}
        </div>
      )}

      <div className="space-y-3">
        {games.map((g) => {
          const openSeats = Math.max(0, g.maxSeats - g.seatedCount);
          const wl = waitCounts[g.id] || 0;
          return (
            <div key={g.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-lg text-cream">{g.name}</div>
                  <div className="mt-1 text-xl font-black text-gold tabular-nums">
                    {formatBlinds(g.smallBlind, g.bigBlind)}
                  </div>
                  <div className="mt-1 text-sm text-cream-muted">
                    {g.gameType} · Buy-in {formatMoney(g.buyInMin)}–{formatMoney(g.buyInMax)}
                  </div>
                  {g.notes && <div className="mt-1 text-xs text-cream-dim">{g.notes}</div>}
                </div>
                <StatusBadge status={g.status} />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-3xl font-black tabular-nums text-cream">
                    {g.seatedCount}
                    <span className="text-cream-dim text-xl">/{g.maxSeats}</span>
                  </div>
                  <div className="text-xs text-cream-dim">
                    {openSeats} open seat{openSeats === 1 ? "" : "s"}
                    {wl > 0 ? ` · ${wl} waiting` : ""}
                  </div>
                </div>
                {g.status !== "closed" && (
                  <button
                    type="button"
                    className="btn-primary text-sm px-4"
                    onClick={() => {
                      setJoinGameId(g.id);
                      setMsg(null);
                    }}
                  >
                    Join Waitlist
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/waitlist" className="btn-secondary w-full text-center">
        View all waitlists
      </Link>

      {joinGameId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <form onSubmit={joinWaitlist} className="card w-full max-w-md space-y-4 border-gold/30">
            <h2 className="text-xl font-bold text-cream">Join Waitlist</h2>
            <p className="text-sm text-cream-muted">
              {games.find((g) => g.id === joinGameId)?.name}
            </p>
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
                Phone (optional)
              </label>
              <input
                id="phone"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="555-0100"
                type="tel"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setJoinGameId(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={busy}>
                {busy ? "Joining…" : "Join"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
