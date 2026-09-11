export type GameStatus = "open" | "full" | "closed";
export type TournamentStatus = "registering" | "late_reg" | "in_play" | "completed" | "cancelled";
export type WaitlistEntryStatus = "waiting" | "seated" | "skipped" | "removed";

export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationMinutes: number;
}

export interface CashGame {
  id: string;
  name: string;
  gameType: string; // NLH, PLO, etc.
  smallBlind: number;
  bigBlind: number;
  buyInMin: number;
  buyInMax: number;
  maxSeats: number;
  seatedCount: number;
  status: GameStatus;
  tableNumber?: number;
  notes?: string;
  updatedAt: string;
}

export interface WaitlistEntry {
  id: string;
  cashGameId: string;
  name: string;
  phone?: string;
  position: number;
  status: WaitlistEntryStatus;
  joinedAt: string;
}

export interface TournamentRegistration {
  id: string;
  playerName: string;
  phone?: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface TournamentClock {
  currentLevelIndex: number;
  levelStartedAt: string | null; // ISO timestamp when current level started (server time)
  pausedAt: string | null; // ISO if paused
  pausedRemainingMs: number | null; // remaining ms when paused
  isRunning: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  gameType: string;
  buyIn: number;
  fee: number;
  startTime: string; // ISO
  maxPlayers: number;
  status: TournamentStatus;
  blindStructure: BlindLevel[];
  registrations: TournamentRegistration[];
  clock: TournamentClock;
  lateRegUntilLevel: number;
  notes?: string;
  updatedAt: string;
}

export interface HouseRules {
  content: string; // markdown-ish plain text with sections
  updatedAt: string;
}

export interface AppStore {
  cashGames: CashGame[];
  waitlist: WaitlistEntry[];
  tournaments: Tournament[];
  houseRules: HouseRules;
  version: number;
}
