export type GameStatus = "open" | "full" | "closed";
export type TournamentStatus = "registering" | "late_reg" | "in_play" | "completed" | "cancelled";
export type WaitlistEntryStatus = "waiting" | "seated" | "skipped" | "removed";
export type PrivateGameStatus = "open" | "full" | "confirmed" | "cancelled";
export type BookingStatus = "pending" | "confirmed" | "declined";
export type PromoMediaType = "image" | "video" | "slide";

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

/** Booked/hosted table — listed on /private, never mixed into public /cash. */
export interface PrivateGame {
  id: string;
  name: string;
  gameType: string;
  blinds: string; // e.g. "$2/$5" or stakes text
  buyInMin: number;
  buyInMax: number; // same as min for flat buy-in
  startAt: string; // ISO
  durationHours: number;
  maxPlayers: number;
  seatedCount: number;
  hostName: string;
  status: PrivateGameStatus;
  notes?: string;
  visibility: "private";
  updatedAt: string;
}

/** Player request for a private table. */
export interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  requestedStartAt: string; // ISO
  gameType: string;
  stakes: string; // blinds/stakes text
  buyIn: number;
  playerCount: number;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  privateGameId?: string;
  staffNote?: string;
}


/** Full-screen TV promo playlist item (images, videos, or branded slides). */
export interface PromoItem {
  id: string;
  type: PromoMediaType;
  /** For image/video: public URL or path. Unused for slide. */
  url?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  /** Seconds to show images/slides. Videos advance on ended. Default 10. */
  durationSeconds?: number;
}

export interface AppStore {
  cashGames: CashGame[];
  waitlist: WaitlistEntry[];
  tournaments: Tournament[];
  houseRules: HouseRules;
  privateGames: PrivateGame[];
  bookings: BookingRequest[];
  promoPlaylist: PromoItem[];
  version: number;
}
