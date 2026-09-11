import type { BlindLevel, Tournament, TournamentClock } from "./types";

export interface ClockSnapshot {
  levelNumber: number;
  current: BlindLevel | null;
  next: BlindLevel | null;
  remainingMs: number;
  remainingDisplay: string;
  isPaused: boolean;
  isRunning: boolean;
  isLevelEnded: boolean;
  levelIndex: number;
  totalLevels: number;
  serverNow: string;
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function getRemainingMs(clock: TournamentClock, levels: BlindLevel[], now = Date.now()): number {
  if (!levels.length) return 0;
  const idx = Math.min(clock.currentLevelIndex, levels.length - 1);
  const level = levels[idx];
  const durationMs = level.durationMinutes * 60 * 1000;

  if (clock.pausedAt != null && clock.pausedRemainingMs != null) {
    return Math.max(0, clock.pausedRemainingMs);
  }

  if (!clock.isRunning || !clock.levelStartedAt) {
    return durationMs;
  }

  const elapsed = now - new Date(clock.levelStartedAt).getTime();
  return Math.max(0, durationMs - elapsed);
}

export function getClockSnapshot(tournament: Tournament, now = Date.now()): ClockSnapshot {
  const { clock, blindStructure } = tournament;
  const idx = Math.min(Math.max(0, clock.currentLevelIndex), Math.max(0, blindStructure.length - 1));
  const current = blindStructure[idx] ?? null;
  const next = blindStructure[idx + 1] ?? null;
  const remainingMs = getRemainingMs(clock, blindStructure, now);

  return {
    levelNumber: current?.level ?? idx + 1,
    current,
    next,
    remainingMs,
    remainingDisplay: formatMs(remainingMs),
    isPaused: Boolean(clock.pausedAt) || (!clock.isRunning && Boolean(clock.levelStartedAt)),
    isRunning: clock.isRunning && !clock.pausedAt,
    isLevelEnded: remainingMs <= 0 && clock.isRunning && !clock.pausedAt,
    levelIndex: idx,
    totalLevels: blindStructure.length,
    serverNow: new Date(now).toISOString(),
  };
}

export function pauseClock(clock: TournamentClock, levels: BlindLevel[]): TournamentClock {
  if (clock.pausedAt) return clock;
  const remaining = getRemainingMs(clock, levels);
  return {
    ...clock,
    isRunning: false,
    pausedAt: new Date().toISOString(),
    pausedRemainingMs: remaining,
  };
}

export function resumeClock(clock: TournamentClock): TournamentClock {
  // Prefer resumeClockWithLevels so remaining time is preserved accurately.
  if (!clock.pausedAt && clock.isRunning) return clock;
  return {
    ...clock,
    isRunning: true,
    pausedAt: null,
    pausedRemainingMs: null,
    levelStartedAt: new Date().toISOString(),
  };
}

export function resumeClockWithLevels(clock: TournamentClock, levels: BlindLevel[]): TournamentClock {
  const remaining = clock.pausedRemainingMs ?? getRemainingMs(clock, levels);
  const idx = Math.min(clock.currentLevelIndex, levels.length - 1);
  const durationMs = (levels[idx]?.durationMinutes ?? 20) * 60 * 1000;
  const elapsedAlready = durationMs - remaining;
  return {
    ...clock,
    isRunning: true,
    pausedAt: null,
    pausedRemainingMs: null,
    levelStartedAt: new Date(Date.now() - Math.max(0, elapsedAlready)).toISOString(),
  };
}

export function skipLevel(clock: TournamentClock, levels: BlindLevel[]): TournamentClock {
  const nextIdx = Math.min(clock.currentLevelIndex + 1, levels.length - 1);
  return {
    currentLevelIndex: nextIdx,
    levelStartedAt: new Date().toISOString(),
    pausedAt: null,
    pausedRemainingMs: null,
    isRunning: true,
  };
}

export function startClock(clock: TournamentClock, levelIndex = 0): TournamentClock {
  return {
    currentLevelIndex: levelIndex,
    levelStartedAt: new Date().toISOString(),
    pausedAt: null,
    pausedRemainingMs: null,
    isRunning: true,
  };
}

export function autoAdvanceIfNeeded(
  clock: TournamentClock,
  levels: BlindLevel[],
  now = Date.now()
): TournamentClock {
  if (!clock.isRunning || clock.pausedAt || !clock.levelStartedAt) return clock;
  let current = { ...clock };
  let guard = 0;
  while (guard < 50) {
    guard++;
    const remaining = getRemainingMs(current, levels, now);
    if (remaining > 0) break;
    if (current.currentLevelIndex >= levels.length - 1) {
      return { ...current, isRunning: false, pausedAt: null, pausedRemainingMs: 0 };
    }
    current = {
      currentLevelIndex: current.currentLevelIndex + 1,
      levelStartedAt: new Date(
        new Date(current.levelStartedAt!).getTime() +
          levels[current.currentLevelIndex].durationMinutes * 60 * 1000
      ).toISOString(),
      pausedAt: null,
      pausedRemainingMs: null,
      isRunning: true,
    };
  }
  return current;
}
