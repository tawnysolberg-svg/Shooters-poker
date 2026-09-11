"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { formatBlinds } from "@/lib/format";

export default function WaitlistPage() {
  const { data, loading, refresh } = useStore(2500);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((j) => setIsAdmin(Boolean(j.authenticated)))
      .catch(() => setIsAdmin(false));
  }, []);

  useEffect(() => {
    if (data && !selectedGame) {
      const first = data.cashGames.find((g) => g.status !== "closed");
      if (first) setSelectedGame(first.id);
    }
  }, [data, selectedGame]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGame || !name.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashGameId: selectedGame,
          name: name.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg(`Joined! You're on the list.`);
      setName("");
      setPhone("");
      refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function staffAction(id: string, action: "seat" | "skip" | "remove") {
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Failed");
      }
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

  const openGames = data.cashGames.filter((g) => g.status !== "closed");
  const waiting = data.waitlist
    .filter((w) => w.status === "waiting")
    .sort((a, b) => a.position - b.position);

  const byGame = openGames.map((g) => ({
    game: g,
    entries: waiting.filter((w) => w.cashGameId === g.id),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Waitlist</h1>
        <p className="mt-1 text-sm text-cream-muted">
          Join by name — staff will call you when a seat opens
        </p>
      </div>

      {msg && (
        <div className="rounded-xl bg-felt-mid border border-felt-light px-4 py-3 text-sm">{msg}</div>
      )}

      <form onSubmit={join} className="card space-y-3 border-gold/20">
        <h2 className="font-bold text-cream">Join a list</h2>
        <div>
          <label className="label">Game</label>
          <select
            className="input"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            required
          >
            {openGames.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({formatBlinds(g.smallBlind, g.bigBlind)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Name *</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="555-0100"
            type="tel"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy || !openGames.length}>
          {busy ? "Joining…" : "Join Waitlist"}
        </button>
      </form>

      <div className="space-y-4">
        {byGame.map(({ game, entries }) => (
          <section key={game.id} className="card">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <div className="font-bold text-cream">{game.name}</div>
                <div className="text-sm text-gold">
                  {formatBlinds(game.smallBlind, game.bigBlind)} · {game.seatedCount}/{game.maxSeats}
                </div>
              </div>
              <StatusBadge status={game.status} />
            </div>
            {entries.length === 0 ? (
              <p className="text-sm text-cream-dim">No one waiting</p>
            ) : (
              <ul className="space-y-2">
                {entries.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-charcoal px-3 py-3 border border-charcoal-light"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-charcoal font-black">
                        {e.position}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-cream truncate">{e.name}</div>
                        {e.phone && <div className="text-xs text-cream-dim">{e.phone}</div>}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1.5 w-full sm:w-auto">
                        <button
                          type="button"
                          className="btn-primary text-xs py-2 px-3 min-h-[44px] flex-1 sm:flex-none"
                          disabled={busy}
                          onClick={() => staffAction(e.id, "seat")}
                        >
                          Seat
                        </button>
                        <button
                          type="button"
                          className="btn-secondary text-xs py-2 px-3 min-h-[44px] flex-1 sm:flex-none"
                          disabled={busy}
                          onClick={() => staffAction(e.id, "skip")}
                        >
                          Skip
                        </button>
                        <button
                          type="button"
                          className="btn-danger text-xs py-2 px-3 min-h-[44px] flex-1 sm:flex-none"
                          disabled={busy}
                          onClick={() => staffAction(e.id, "remove")}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
