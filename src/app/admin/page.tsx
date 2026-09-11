"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CashGame, Tournament, BlindLevel, PrivateGame, BookingRequest } from "@/lib/types";
import { formatBlinds, formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { getClockSnapshot } from "@/lib/clock";

type Tab = "cash" | "tournaments" | "clock" | "waitlist" | "checkin" | "private" | "bookings" | "rules";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("cash");
  const [cashGames, setCashGames] = useState<CashGame[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [waitlist, setWaitlist] = useState<
    Array<{
      id: string;
      cashGameId: string;
      name: string;
      phone?: string;
      position: number;
      status: string;
    }>
  >([]);
  const [privateGames, setPrivateGames] = useState<PrivateGame[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/store", { cache: "no-store" });
    const json = await res.json();
    setCashGames(json.cashGames);
    setTournaments(json.tournaments);
    setWaitlist(json.waitlist.filter((w: { status: string }) => w.status === "waiting"));
    setPrivateGames(json.privateGames || []);
    setBookings(json.bookings || []);
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((j) => setAuthed(Boolean(j.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [authed, refresh]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      setPinError("Invalid PIN");
      return;
    }
    setAuthed(true);
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  }

  if (authed === null) {
    return <div className="h-40 animate-pulse rounded-2xl bg-charcoal-mid" />;
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm space-y-6 pt-8">
        <div className="text-center">
          <h1 className="page-title">Staff Access</h1>
          <p className="mt-2 text-sm text-cream-muted">Shooters Poker Room admin</p>
        </div>
        <form onSubmit={login} className="card space-y-4 border-gold/30">
          <div>
            <label className="label">PIN</label>
            <input
              className="input text-center text-2xl tracking-[0.4em] font-bold"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              required
            />
          </div>
          {pinError && <p className="text-sm text-red-300">{pinError}</p>}
          <button type="submit" className="btn-primary w-full">
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Admin</h1>
          <p className="text-sm text-cream-muted">Shooters Poker Room</p>
        </div>
        <div className="flex gap-2">
          <Link href="/tv" className="btn-ghost text-xs py-2 px-3 min-h-[44px]">
            TV
          </Link>
          <button type="button" className="btn-ghost text-xs py-2 px-3" onClick={logout}>
            Lock
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-xl bg-felt-mid border border-felt-light px-4 py-3 text-sm">{msg}</div>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {(
          [
            ["cash", "Cash"],
            ["tournaments", "Tourneys"],
            ["clock", "Clock"],
            ["waitlist", "Waitlist"],
            ["private", "Private"],
            ["bookings", "Bookings"],
            ["checkin", "Check-in"],
            ["rules", "Rules"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold min-h-[44px] ${
              tab === k ? "bg-gold text-charcoal" : "bg-charcoal-mid text-cream-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "cash" && (
        <CashAdmin
          games={cashGames}
          busy={busy}
          setBusy={setBusy}
          setMsg={setMsg}
          refresh={refresh}
        />
      )}
      {tab === "tournaments" && (
        <TournamentAdmin
          tournaments={tournaments}
          busy={busy}
          setBusy={setBusy}
          setMsg={setMsg}
          refresh={refresh}
        />
      )}
      {tab === "clock" && (
        <ClockAdmin
          tournaments={tournaments}
          busy={busy}
          setBusy={setBusy}
          setMsg={setMsg}
          refresh={refresh}
        />
      )}
      {tab === "waitlist" && (
        <WaitlistAdmin
          waitlist={waitlist}
          cashGames={cashGames}
          busy={busy}
          setBusy={setBusy}
          setMsg={setMsg}
          refresh={refresh}
        />
      )}
      {tab === "checkin" && (
        <div className="card">
          <p className="text-sm text-cream-muted mb-3">
            Use the door check-in page for large tap targets.
          </p>
          <Link href="/check-in" className="btn-primary w-full text-center">
            Open Check-In
          </Link>
        </div>
      )}
      {tab === "private" && (
        <PrivateAdmin
          games={privateGames}
          busy={busy}
          setBusy={setBusy}
          setMsg={setMsg}
          refresh={refresh}
        />
      )}
      {tab === "bookings" && (
        <BookingsAdmin
          bookings={bookings}
          privateGames={privateGames}
          busy={busy}
          setBusy={setBusy}
          setMsg={setMsg}
          refresh={refresh}
        />
      )}
      {tab === "rules" && (
        <div className="card">
          <p className="text-sm text-cream-muted mb-3">Edit house rules on the rules page.</p>
          <Link href="/rules" className="btn-secondary w-full text-center">
            Open Rules
          </Link>
        </div>
      )}
    </div>
  );
}

function CashAdmin({
  games,
  busy,
  setBusy,
  setMsg,
  refresh,
}: {
  games: CashGame[];
  busy: boolean;
  setBusy: (b: boolean) => void;
  setMsg: (m: string | null) => void;
  refresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<CashGame | null>(null);
  const blank: {
    name: string;
    gameType: string;
    smallBlind: number;
    bigBlind: number;
    buyInMin: number;
    buyInMax: number;
    maxSeats: number;
    seatedCount: number;
    status: CashGame["status"];
    tableNumber: number;
  } = {
    name: "",
    gameType: "NLH",
    smallBlind: 1,
    bigBlind: 2,
    buyInMin: 100,
    buyInMax: 300,
    maxSeats: 9,
    seatedCount: 0,
    status: "open",
    tableNumber: 1,
  };
  const [form, setForm] = useState(blank);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/cash", {
        method: edit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit ? { ...form, id: edit.id } : form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg(edit ? "Game updated" : "Game added");
      setShowForm(false);
      setEdit(null);
      setForm(blank);
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this cash game?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/cash?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setMsg("Deleted");
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, patch: Partial<CashGame>) {
    setBusy(true);
    try {
      const res = await fetch("/api/cash", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) throw new Error("Failed");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="btn-primary w-full"
        onClick={() => {
          setEdit(null);
          setForm(blank);
          setShowForm(true);
        }}
      >
        + Add cash game
      </button>

      {showForm && (
        <form onSubmit={save} className="card space-y-3 border-gold/30">
          <h3 className="font-bold">{edit ? "Edit game" : "New cash game"}</h3>
          {(
            [
              ["name", "Name", "text"],
              ["gameType", "Game type", "text"],
              ["smallBlind", "Small blind", "number"],
              ["bigBlind", "Big blind", "number"],
              ["buyInMin", "Min buy-in", "number"],
              ["buyInMax", "Max buy-in", "number"],
              ["maxSeats", "Max seats", "number"],
              ["seatedCount", "Seated", "number"],
              ["tableNumber", "Table #", "number"],
            ] as const
          ).map(([key, label, type]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="input"
                type={type}
                value={String(form[key] ?? "")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]:
                      type === "number" ? Number(e.target.value) : e.target.value,
                  })
                }
                required={key === "name"}
              />
            </div>
          ))}
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as CashGame["status"] })
              }
            >
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={busy}>
              Save
            </button>
          </div>
        </form>
      )}

      {games.map((g) => (
        <div key={g.id} className="card space-y-3">
          <div className="flex justify-between gap-2">
            <div>
              <div className="font-bold text-cream">{g.name}</div>
              <div className="text-gold text-sm">
                {formatBlinds(g.smallBlind, g.bigBlind)} · {g.seatedCount}/{g.maxSeats}
              </div>
            </div>
            <StatusBadge status={g.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() =>
                patch(g.id, {
                  seatedCount: Math.min(g.maxSeats, g.seatedCount + 1),
                  status:
                    g.seatedCount + 1 >= g.maxSeats ? "full" : g.status === "closed" ? "open" : g.status,
                })
              }
            >
              +Seat
            </button>
            <button
              type="button"
              className="btn-secondary text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() =>
                patch(g.id, {
                  seatedCount: Math.max(0, g.seatedCount - 1),
                  status: g.status === "full" ? "open" : g.status,
                })
              }
            >
              −Seat
            </button>
            <button
              type="button"
              className="btn-secondary text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() =>
                patch(g.id, {
                  status: g.status === "closed" ? "open" : "closed",
                  seatedCount: g.status === "closed" ? g.seatedCount : 0,
                })
              }
            >
              {g.status === "closed" ? "Open" : "Close"}
            </button>
            <button
              type="button"
              className="btn-ghost text-xs py-2 px-3 min-h-[44px]"
              onClick={() => {
                setEdit(g);
                setForm({
                  name: g.name,
                  gameType: g.gameType,
                  smallBlind: g.smallBlind,
                  bigBlind: g.bigBlind,
                  buyInMin: g.buyInMin,
                  buyInMax: g.buyInMax,
                  maxSeats: g.maxSeats,
                  seatedCount: g.seatedCount,
                  status: g.status,
                  tableNumber: g.tableNumber || 1,
                });
                setShowForm(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn-danger text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() => remove(g.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TournamentAdmin({
  tournaments,
  busy,
  setBusy,
  setMsg,
  refresh,
}: {
  tournaments: Tournament[];
  busy: boolean;
  setBusy: (b: boolean) => void;
  setMsg: (m: string | null) => void;
  refresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gameType: "NLH",
    buyIn: 100,
    fee: 20,
    startTime: "",
    maxPlayers: 60,
    status: "registering",
    lateRegUntilLevel: 5,
    levelDuration: 20,
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const blinds: BlindLevel[] = [1, 2, 3, 4, 5, 6, 7, 8].map((level, i) => {
        const sb = [100, 200, 300, 400, 500, 600, 800, 1000][i];
        return {
          level,
          smallBlind: sb,
          bigBlind: sb * 2,
          ante: level >= 3 ? Math.round(sb / 3) : 0,
          durationMinutes: form.levelDuration,
        };
      });
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startTime: form.startTime
            ? new Date(form.startTime).toISOString()
            : new Date().toISOString(),
          blindStructure: blinds,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg("Tournament created");
      setShowForm(false);
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete tournament?")) return;
    setBusy(true);
    try {
      await fetch(`/api/tournaments?id=${id}`, { method: "DELETE" });
      setMsg("Deleted");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" className="btn-primary w-full" onClick={() => setShowForm(true)}>
        + Add tournament
      </button>

      {showForm && (
        <form onSubmit={create} className="card space-y-3 border-gold/30">
          <h3 className="font-bold">New tournament</h3>
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Game type"
            value={form.gameType}
            onChange={(e) => setForm({ ...form, gameType: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              type="number"
              placeholder="Buy-in"
              value={form.buyIn}
              onChange={(e) => setForm({ ...form, buyIn: Number(e.target.value) })}
            />
            <input
              className="input"
              type="number"
              placeholder="Fee"
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
            />
          </div>
          <input
            className="input"
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              type="number"
              placeholder="Max players"
              value={form.maxPlayers}
              onChange={(e) => setForm({ ...form, maxPlayers: Number(e.target.value) })}
            />
            <input
              className="input"
              type="number"
              placeholder="Level mins"
              value={form.levelDuration}
              onChange={(e) => setForm({ ...form, levelDuration: Number(e.target.value) })}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={busy}>
              Create
            </button>
          </div>
        </form>
      )}

      {tournaments.map((t) => (
        <div key={t.id} className="card space-y-3">
          <div className="flex justify-between gap-2">
            <div>
              <div className="font-bold">{t.name}</div>
              <div className="text-sm text-cream-muted">
                {formatMoney(t.buyIn + t.fee)} · {formatDateTime(t.startTime)} ·{" "}
                {t.registrations.length} reg
              </div>
            </div>
            <StatusBadge status={t.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="input min-h-[44px] py-2 w-auto"
              value={t.status}
              disabled={busy}
              onChange={(e) => updateStatus(t.id, e.target.value)}
            >
              <option value="registering">Registering</option>
              <option value="late_reg">Late reg</option>
              <option value="in_play">In play</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Link
              href={`/tournaments/${t.id}`}
              className="btn-ghost text-xs py-2 px-3 min-h-[44px]"
            >
              View
            </Link>
            <button
              type="button"
              className="btn-danger text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() => remove(t.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClockAdmin({
  tournaments,
  busy,
  setBusy,
  setMsg,
  refresh,
}: {
  tournaments: Tournament[];
  busy: boolean;
  setBusy: (b: boolean) => void;
  setMsg: (m: string | null) => void;
  refresh: () => Promise<void>;
}) {
  const live = tournaments.filter((t) =>
    ["in_play", "registering", "late_reg"].includes(t.status)
  );

  async function clockAction(tournamentId: string, action: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg(`${action} OK`);
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {live.map((t) => {
        const snap = getClockSnapshot(t);
        return (
          <div key={t.id} className="card space-y-3">
            <div className="font-bold text-cream">{t.name}</div>
            <div className="text-3xl font-black text-gold tabular-nums text-center">
              {snap.remainingDisplay}
            </div>
            <div className="text-center text-cream">
              L{snap.levelNumber}: {snap.current?.smallBlind}/{snap.current?.bigBlind}
              {snap.isPaused ? " · PAUSED" : ""}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn-primary"
                disabled={busy}
                onClick={() => clockAction(t.id, t.clock.isRunning && !t.clock.pausedAt ? "pause" : "resume")}
              >
                {t.clock.isRunning && !t.clock.pausedAt ? "Pause" : "Resume"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() => clockAction(t.id, "skip")}
              >
                Skip level
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={busy}
                onClick={() => clockAction(t.id, "start")}
              >
                Start / restart
              </button>
              <Link href="/tv" className="btn-ghost text-center">
                TV view
              </Link>
            </div>
          </div>
        );
      })}
      {live.length === 0 && (
        <p className="text-sm text-cream-dim">No active tournaments for clock control.</p>
      )}
    </div>
  );
}

function WaitlistAdmin({
  waitlist,
  cashGames,
  busy,
  setBusy,
  setMsg,
  refresh,
}: {
  waitlist: Array<{
    id: string;
    cashGameId: string;
    name: string;
    phone?: string;
    position: number;
  }>;
  cashGames: CashGame[];
  busy: boolean;
  setBusy: (b: boolean) => void;
  setMsg: (m: string | null) => void;
  refresh: () => Promise<void>;
}) {
  async function action(id: string, act: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: act }),
      });
      if (!res.ok) throw new Error("Failed");
      setMsg(`${act} done`);
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const gameName = (id: string) => cashGames.find((g) => g.id === id)?.name || id;

  return (
    <div className="space-y-2">
      {waitlist.map((w) => (
        <div key={w.id} className="card flex flex-col gap-2">
          <div>
            <span className="font-bold text-gold mr-2">#{w.position}</span>
            <span className="font-semibold text-cream">{w.name}</span>
            <div className="text-xs text-cream-dim">{gameName(w.cashGameId)}</div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary flex-1 text-sm"
              disabled={busy}
              onClick={() => action(w.id, "seat")}
            >
              Seat
            </button>
            <button
              type="button"
              className="btn-secondary flex-1 text-sm"
              disabled={busy}
              onClick={() => action(w.id, "skip")}
            >
              Skip
            </button>
            <button
              type="button"
              className="btn-danger flex-1 text-sm"
              disabled={busy}
              onClick={() => action(w.id, "remove")}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      {waitlist.length === 0 && <p className="text-sm text-cream-dim">Waitlist empty</p>}
    </div>
  );
}

function PrivateAdmin({
  games,
  busy,
  setBusy,
  setMsg,
  refresh,
}: {
  games: PrivateGame[];
  busy: boolean;
  setBusy: (b: boolean) => void;
  setMsg: (m: string | null) => void;
  refresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<PrivateGame | null>(null);
  const blank = {
    name: "",
    gameType: "NLH",
    blinds: "$1/$2",
    buyInMin: 200,
    buyInMax: 500,
    startAt: "",
    durationHours: 4,
    maxPlayers: 9,
    seatedCount: 0,
    hostName: "",
    status: "open" as PrivateGame["status"],
    notes: "",
  };
  const [form, setForm] = useState(blank);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        startAt: form.startAt
          ? new Date(form.startAt).toISOString()
          : new Date().toISOString(),
        notes: form.notes || undefined,
      };
      const res = await fetch("/api/private", {
        method: edit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit ? { ...payload, id: edit.id } : payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg(edit ? "Private game updated" : "Private game added");
      setShowForm(false);
      setEdit(null);
      setForm(blank);
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, data: Partial<PrivateGame>) {
    setBusy(true);
    try {
      const res = await fetch("/api/private", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("Failed");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this private game?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/private?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setMsg("Deleted");
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function toLocalInput(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const sorted = [...games].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="btn-primary w-full"
        onClick={() => {
          setEdit(null);
          setForm(blank);
          setShowForm(true);
        }}
      >
        + Add private game
      </button>

      {showForm && (
        <form onSubmit={save} className="card space-y-3 border-gold/30">
          <h3 className="font-bold">{edit ? "Edit private game" : "New private game"}</h3>
          {(
            [
              ["name", "Name", "text"],
              ["gameType", "Game type", "text"],
              ["blinds", "Blinds / stakes", "text"],
              ["buyInMin", "Min buy-in", "number"],
              ["buyInMax", "Max buy-in", "number"],
              ["durationHours", "Duration (hours)", "number"],
              ["maxPlayers", "Max players", "number"],
              ["seatedCount", "Seated", "number"],
              ["hostName", "Host name", "text"],
            ] as const
          ).map(([key, label, type]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="input"
                type={type}
                value={String(form[key] ?? "")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: type === "number" ? Number(e.target.value) : e.target.value,
                  })
                }
                required={key === "name" || key === "hostName"}
              />
            </div>
          ))}
          <div>
            <label className="label">Start</label>
            <input
              className="input"
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              required={!edit}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as PrivateGame["status"] })
              }
            >
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <input
              className="input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={busy}>
              Save
            </button>
          </div>
        </form>
      )}

      {sorted.map((g) => (
        <div key={g.id} className="card space-y-3">
          <div className="flex justify-between gap-2">
            <div>
              <div className="font-bold text-cream">{g.name}</div>
              <div className="text-gold text-sm">
                {g.blinds} · {g.seatedCount}/{g.maxPlayers} · {formatDateTime(g.startAt)}
              </div>
              <div className="text-xs text-cream-dim">Host: {g.hostName}</div>
            </div>
            <StatusBadge status={g.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() =>
                patch(g.id, {
                  seatedCount: Math.min(g.maxPlayers, g.seatedCount + 1),
                  status:
                    g.seatedCount + 1 >= g.maxPlayers
                      ? "full"
                      : g.status === "cancelled"
                        ? "open"
                        : g.status,
                })
              }
            >
              +Seat
            </button>
            <button
              type="button"
              className="btn-secondary text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() =>
                patch(g.id, {
                  seatedCount: Math.max(0, g.seatedCount - 1),
                  status: g.status === "full" ? "open" : g.status,
                })
              }
            >
              −Seat
            </button>
            <button
              type="button"
              className="btn-secondary text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() =>
                patch(g.id, {
                  status: g.status === "cancelled" ? "open" : "cancelled",
                })
              }
            >
              {g.status === "cancelled" ? "Reopen" : "Cancel"}
            </button>
            <button
              type="button"
              className="btn-ghost text-xs py-2 px-3 min-h-[44px]"
              onClick={() => {
                setEdit(g);
                setForm({
                  name: g.name,
                  gameType: g.gameType,
                  blinds: g.blinds,
                  buyInMin: g.buyInMin,
                  buyInMax: g.buyInMax,
                  startAt: toLocalInput(g.startAt),
                  durationHours: g.durationHours,
                  maxPlayers: g.maxPlayers,
                  seatedCount: g.seatedCount,
                  hostName: g.hostName,
                  status: g.status,
                  notes: g.notes || "",
                });
                setShowForm(true);
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn-danger text-xs py-2 px-3 min-h-[44px]"
              disabled={busy}
              onClick={() => remove(g.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      {sorted.length === 0 && <p className="text-sm text-cream-dim">No private games</p>}
    </div>
  );
}

function BookingsAdmin({
  bookings,
  privateGames,
  busy,
  setBusy,
  setMsg,
  refresh,
}: {
  bookings: BookingRequest[];
  privateGames: PrivateGame[];
  busy: boolean;
  setBusy: (b: boolean) => void;
  setMsg: (m: string | null) => void;
  refresh: () => Promise<void>;
}) {
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [staffNote, setStaffNote] = useState("");

  async function confirm(id: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "confirm" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg("Booking confirmed — private game created");
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function decline(id: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "decline", staffNote: staffNote || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMsg("Booking declined");
      setDeclineId(null);
      setStaffNote("");
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const order = { pending: 0, confirmed: 1, declined: 2 };
  const sorted = [...bookings].sort((a, b) => {
    const byStatus = (order[a.status] ?? 9) - (order[b.status] ?? 9);
    if (byStatus !== 0) return byStatus;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-3">
      {sorted.map((b) => {
        const linked = b.privateGameId
          ? privateGames.find((g) => g.id === b.privateGameId)
          : null;
        return (
          <div key={b.id} className="card space-y-3">
            <div className="flex justify-between gap-2">
              <div>
                <div className="font-bold text-cream">{b.name}</div>
                <div className="text-sm text-cream-muted">{b.phone}</div>
                <div className="mt-1 text-gold text-sm">
                  {b.gameType} · {b.stakes} · {formatMoney(b.buyIn)} · {b.playerCount} players
                </div>
                <div className="text-xs text-cream-dim mt-1">
                  Requested {formatDateTime(b.requestedStartAt)}
                </div>
                {b.notes && <div className="text-xs text-cream-dim mt-1">{b.notes}</div>}
                {b.staffNote && (
                  <div className="text-xs text-amber-200/80 mt-1">Staff: {b.staffNote}</div>
                )}
                {linked && (
                  <div className="text-xs text-emerald-300 mt-1">Linked: {linked.name}</div>
                )}
              </div>
              <StatusBadge status={b.status} />
            </div>
            {b.status === "pending" && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary flex-1 text-sm"
                  disabled={busy}
                  onClick={() => confirm(b.id)}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="btn-danger flex-1 text-sm"
                  disabled={busy}
                  onClick={() => {
                    setDeclineId(b.id);
                    setStaffNote("");
                  }}
                >
                  Decline
                </button>
              </div>
            )}
            {declineId === b.id && (
              <div className="space-y-2 border-t border-charcoal-light pt-3">
                <label className="label">Optional note</label>
                <input
                  className="input"
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  placeholder="Reason for decline"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setDeclineId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger flex-1"
                    disabled={busy}
                    onClick={() => decline(b.id)}
                  >
                    Confirm decline
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {sorted.length === 0 && <p className="text-sm text-cream-dim">No booking requests</p>}
    </div>
  );
}
