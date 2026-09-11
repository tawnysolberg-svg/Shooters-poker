"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppStore, CashGame, Tournament, WaitlistEntry, HouseRules } from "./types";
import type { ClockSnapshot } from "./clock";

export type StorePayload = AppStore & { serverTime: string };

export function useStore(pollMs = 3000) {
  const [data, setData] = useState<StorePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/store", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  return { data, error, loading, refresh };
}

export function useClock(tournamentId: string | null, pollMs = 1000) {
  const [clock, setClock] = useState<ClockSnapshot | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [serverSkew, setServerSkew] = useState(0);
  const [flash, setFlash] = useState(false);
  const prevLevel = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const res = await fetch(`/api/clock?tournamentId=${tournamentId}`, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const serverTime = new Date(json.serverTime).getTime();
      setServerSkew(serverTime - Date.now());
      setClock(json.clock);
      setTournament(json.tournament);

      if (prevLevel.current !== null && json.clock.levelIndex !== prevLevel.current) {
        setFlash(true);
        setTimeout(() => setFlash(false), 2000);
      }
      prevLevel.current = json.clock.levelIndex;

      if (json.clock.isLevelEnded) {
        setFlash(true);
      }
    } catch {
      /* ignore */
    }
  }, [tournamentId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  // Local tick between polls using server-corrected remaining
  const [displayMs, setDisplayMs] = useState<number | null>(null);
  const anchor = useRef<{ remaining: number; at: number; paused: boolean } | null>(null);

  useEffect(() => {
    if (!clock) return;
    anchor.current = {
      remaining: clock.remainingMs,
      at: Date.now(),
      paused: clock.isPaused || !clock.isRunning,
    };
    setDisplayMs(clock.remainingMs);
  }, [clock]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!anchor.current) return;
      if (anchor.current.paused) {
        setDisplayMs(anchor.current.remaining);
        return;
      }
      const elapsed = Date.now() - anchor.current.at;
      const next = Math.max(0, anchor.current.remaining - elapsed);
      setDisplayMs(next);
      if (next === 0 && !flash) setFlash(true);
    }, 200);
    return () => clearInterval(id);
  }, [flash]);

  return { clock, tournament, displayMs, flash, serverSkew, refresh };
}

export type { CashGame, Tournament, WaitlistEntry, HouseRules };
