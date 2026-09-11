"use client";

import { useCallback, useEffect, useState } from "react";

interface Result {
  registrationId: string;
  tournamentId: string;
  tournamentName: string;
  playerName: string;
  phone?: string;
  checkedIn: boolean;
}

export default function CheckInPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    const res = await fetch(`/api/check-in?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    const json = await res.json();
    setResults(json.results || []);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(q), 200);
    return () => clearTimeout(t);
  }, [q, search]);

  async function toggle(r: Result) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: r.tournamentId,
          registrationId: r.registrationId,
          checkedIn: !r.checkedIn,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg(
        !r.checkedIn
          ? `${r.playerName} checked in`
          : `${r.playerName} check-in cleared`
      );
      await search(q);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Door Check-In</h1>
        <p className="mt-1 text-sm text-cream-muted">
          Search or tap a registered player at Shooters Poker Room
        </p>
      </div>

      <input
        className="input text-lg"
        placeholder="Search name or phone…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />

      {msg && (
        <div className="rounded-xl bg-felt-mid border border-felt-light px-4 py-3 text-sm">
          {msg}
        </div>
      )}

      <ul className="space-y-2">
        {results.map((r) => (
          <li key={`${r.tournamentId}-${r.registrationId}`}>
            <button
              type="button"
              disabled={busy}
              onClick={() => toggle(r)}
              className={`w-full card text-left flex items-center justify-between gap-3 min-h-[64px] active:scale-[0.99] transition border ${
                r.checkedIn ? "border-emerald-500/50 bg-emerald-900/20" : "border-charcoal-light"
              }`}
            >
              <div>
                <div className="font-bold text-lg text-cream">{r.playerName}</div>
                <div className="text-sm text-cream-muted">{r.tournamentName}</div>
                {r.phone && <div className="text-xs text-cream-dim">{r.phone}</div>}
              </div>
              <span
                className={`badge border ${
                  r.checkedIn
                    ? "bg-emerald-600/30 text-emerald-200 border-emerald-500/40"
                    : "bg-charcoal text-cream-dim border-charcoal-soft"
                }`}
              >
                {r.checkedIn ? "Checked in" : "Tap to check in"}
              </span>
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <li className="text-sm text-cream-dim text-center py-8">
            {q ? "No matching players" : "All registered players shown above — type to filter"}
          </li>
        )}
      </ul>
    </div>
  );
}
