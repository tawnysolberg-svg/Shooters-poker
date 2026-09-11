import type { AppStore, BlindLevel } from "./types";

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function standardBlindStructure(): BlindLevel[] {
  return [
    { level: 1, smallBlind: 100, bigBlind: 200, ante: 0, durationMinutes: 20 },
    { level: 2, smallBlind: 200, bigBlind: 400, ante: 0, durationMinutes: 20 },
    { level: 3, smallBlind: 300, bigBlind: 600, ante: 100, durationMinutes: 20 },
    { level: 4, smallBlind: 400, bigBlind: 800, ante: 100, durationMinutes: 20 },
    { level: 5, smallBlind: 500, bigBlind: 1000, ante: 100, durationMinutes: 20 },
    { level: 6, smallBlind: 600, bigBlind: 1200, ante: 200, durationMinutes: 15 },
    { level: 7, smallBlind: 800, bigBlind: 1600, ante: 200, durationMinutes: 15 },
    { level: 8, smallBlind: 1000, bigBlind: 2000, ante: 300, durationMinutes: 15 },
    { level: 9, smallBlind: 1500, bigBlind: 3000, ante: 400, durationMinutes: 15 },
    { level: 10, smallBlind: 2000, bigBlind: 4000, ante: 500, durationMinutes: 15 },
    { level: 11, smallBlind: 3000, bigBlind: 6000, ante: 1000, durationMinutes: 15 },
    { level: 12, smallBlind: 4000, bigBlind: 8000, ante: 1000, durationMinutes: 12 },
    { level: 13, smallBlind: 5000, bigBlind: 10000, ante: 1500, durationMinutes: 12 },
    { level: 14, smallBlind: 8000, bigBlind: 16000, ante: 2000, durationMinutes: 12 },
    { level: 15, smallBlind: 10000, bigBlind: 20000, ante: 3000, durationMinutes: 12 },
  ];
}

function todayAt(hours: number, minutes = 0): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function daysFromNow(days: number, hours: number, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

const now = new Date();
// Mid-level clock: level 4 (index 3), started ~8 minutes ago so ~12 min remaining of 20
const levelStartedAt = new Date(now.getTime() - 8 * 60 * 1000).toISOString();

export function createSeedStore(): AppStore {
  const cash1 = id("cash");
  const cash2 = id("cash");
  const cash3 = id("cash");
  const cash4 = id("cash");
  const cash5 = id("cash");
  const cash6 = id("cash");

  const tourneyLive = id("tny");
  const tourneyTonight = id("tny");
  const tourneySat = id("tny");
  const tourneySun = id("tny");
  const tourneyWed = id("tny");

  const updatedAt = now.toISOString();

  return {
    version: 1,
    cashGames: [
      {
        id: cash1,
        name: "1/2 NLH — Table 1",
        gameType: "NLH",
        smallBlind: 1,
        bigBlind: 2,
        buyInMin: 100,
        buyInMax: 300,
        maxSeats: 9,
        seatedCount: 7,
        status: "open",
        tableNumber: 1,
        updatedAt,
      },
      {
        id: cash2,
        name: "1/2 NLH — Table 2",
        gameType: "NLH",
        smallBlind: 1,
        bigBlind: 2,
        buyInMin: 100,
        buyInMax: 300,
        maxSeats: 9,
        seatedCount: 9,
        status: "full",
        tableNumber: 2,
        updatedAt,
      },
      {
        id: cash3,
        name: "1/2 NLH — Table 3",
        gameType: "NLH",
        smallBlind: 1,
        bigBlind: 2,
        buyInMin: 100,
        buyInMax: 300,
        maxSeats: 9,
        seatedCount: 5,
        status: "open",
        tableNumber: 3,
        updatedAt,
      },
      {
        id: cash4,
        name: "2/5 NLH — Table 5",
        gameType: "NLH",
        smallBlind: 2,
        bigBlind: 5,
        buyInMin: 300,
        buyInMax: 1000,
        maxSeats: 9,
        seatedCount: 8,
        status: "open",
        tableNumber: 5,
        updatedAt,
      },
      {
        id: cash5,
        name: "1/2 PLO — Table 7",
        gameType: "PLO",
        smallBlind: 1,
        bigBlind: 2,
        buyInMin: 100,
        buyInMax: 400,
        maxSeats: 8,
        seatedCount: 6,
        status: "open",
        tableNumber: 7,
        notes: "Pot-limit Omaha hi only",
        updatedAt,
      },
      {
        id: cash6,
        name: "1/2 NLH — Table 4",
        gameType: "NLH",
        smallBlind: 1,
        bigBlind: 2,
        buyInMin: 100,
        buyInMax: 300,
        maxSeats: 9,
        seatedCount: 0,
        status: "closed",
        tableNumber: 4,
        updatedAt,
      },
    ],
    waitlist: [
      {
        id: id("wl"),
        cashGameId: cash2,
        name: "Marcus T.",
        phone: "555-0142",
        position: 1,
        status: "waiting",
        joinedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: id("wl"),
        cashGameId: cash2,
        name: "Jenny K.",
        position: 2,
        status: "waiting",
        joinedAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
      },
      {
        id: id("wl"),
        cashGameId: cash2,
        name: "Omar R.",
        phone: "555-0198",
        position: 3,
        status: "waiting",
        joinedAt: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: id("wl"),
        cashGameId: cash4,
        name: "Chris P.",
        position: 1,
        status: "waiting",
        joinedAt: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
      },
      {
        id: id("wl"),
        cashGameId: cash1,
        name: "Dana L.",
        position: 1,
        status: "waiting",
        joinedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      },
    ],
    tournaments: [
      {
        id: tourneyLive,
        name: "$150 NLH Deepstack",
        gameType: "NLH",
        buyIn: 125,
        fee: 25,
        startTime: todayAt(14, 0),
        maxPlayers: 80,
        status: "in_play",
        blindStructure: standardBlindStructure(),
        lateRegUntilLevel: 6,
        clock: {
          currentLevelIndex: 3, // Level 4
          levelStartedAt,
          pausedAt: null,
          pausedRemainingMs: null,
          isRunning: true,
        },
        registrations: [
          { id: id("reg"), playerName: "Alex Rivera", phone: "555-0101", registeredAt: todayAt(10, 0), checkedIn: true, checkedInAt: todayAt(13, 45) },
          { id: id("reg"), playerName: "Sam Chen", registeredAt: todayAt(10, 15), checkedIn: true, checkedInAt: todayAt(13, 50) },
          { id: id("reg"), playerName: "Jordan Blake", phone: "555-0103", registeredAt: todayAt(11, 0), checkedIn: true, checkedInAt: todayAt(13, 55) },
          { id: id("reg"), playerName: "Taylor Morgan", registeredAt: todayAt(11, 30), checkedIn: true, checkedInAt: todayAt(13, 58) },
          { id: id("reg"), playerName: "Casey Quinn", phone: "555-0105", registeredAt: todayAt(12, 0), checkedIn: true, checkedInAt: todayAt(14, 0) },
          { id: id("reg"), playerName: "Riley Hayes", registeredAt: todayAt(12, 20), checkedIn: true, checkedInAt: todayAt(14, 2) },
          { id: id("reg"), playerName: "Morgan Lee", phone: "555-0107", registeredAt: todayAt(12, 45), checkedIn: false },
          { id: id("reg"), playerName: "Avery Brooks", registeredAt: todayAt(13, 0), checkedIn: true, checkedInAt: todayAt(14, 5) },
          { id: id("reg"), playerName: "Jamie Torres", phone: "555-0109", registeredAt: todayAt(13, 10), checkedIn: false },
          { id: id("reg"), playerName: "Drew Patel", registeredAt: todayAt(13, 20), checkedIn: true, checkedInAt: todayAt(14, 8) },
          { id: id("reg"), playerName: "Cameron Ng", registeredAt: todayAt(13, 30), checkedIn: true, checkedInAt: todayAt(14, 10) },
          { id: id("reg"), playerName: "Skyler Dunn", phone: "555-0112", registeredAt: todayAt(13, 40), checkedIn: false },
          { id: id("reg"), playerName: "Reese Kim", registeredAt: todayAt(13, 50), checkedIn: true, checkedInAt: todayAt(14, 12) },
          { id: id("reg"), playerName: "Harper Diaz", registeredAt: todayAt(14, 0), checkedIn: true, checkedInAt: todayAt(14, 15) },
          { id: id("reg"), playerName: "Quinn Foster", phone: "555-0115", registeredAt: todayAt(14, 5), checkedIn: false },
          { id: id("reg"), playerName: "Blake Nguyen", registeredAt: todayAt(14, 10), checkedIn: true, checkedInAt: todayAt(14, 20) },
          { id: id("reg"), playerName: "Finley Cruz", registeredAt: todayAt(14, 15), checkedIn: true, checkedInAt: todayAt(14, 22) },
          { id: id("reg"), playerName: "Rowan Ellis", phone: "555-0118", registeredAt: todayAt(14, 20), checkedIn: false },
          { id: id("reg"), playerName: "Parker Shaw", registeredAt: todayAt(14, 25), checkedIn: true, checkedInAt: todayAt(14, 30) },
          { id: id("reg"), playerName: "Emery Wells", registeredAt: todayAt(14, 30), checkedIn: true, checkedInAt: todayAt(14, 35) },
        ],
        notes: "20-min levels through Level 5, then 15. Late reg through Level 6.",
        updatedAt,
      },
      {
        id: tourneyTonight,
        name: "$80 NLH Nightly",
        gameType: "NLH",
        buyIn: 65,
        fee: 15,
        startTime: todayAt(19, 30),
        maxPlayers: 60,
        status: "registering",
        blindStructure: standardBlindStructure().map((l) => ({
          ...l,
          durationMinutes: l.level <= 5 ? 15 : 12,
        })),
        lateRegUntilLevel: 5,
        clock: {
          currentLevelIndex: 0,
          levelStartedAt: null,
          pausedAt: null,
          pausedRemainingMs: null,
          isRunning: false,
        },
        registrations: [
          { id: id("reg"), playerName: "Nick Valdez", registeredAt: todayAt(15, 0), checkedIn: false },
          { id: id("reg"), playerName: "Priya Shah", phone: "555-0202", registeredAt: todayAt(15, 30), checkedIn: false },
          { id: id("reg"), playerName: "Luis Ortega", registeredAt: todayAt(16, 0), checkedIn: false },
          { id: id("reg"), playerName: "Hannah Cole", registeredAt: todayAt(16, 45), checkedIn: false },
          { id: id("reg"), playerName: "Ben Adler", phone: "555-0205", registeredAt: todayAt(17, 15), checkedIn: false },
        ],
        updatedAt,
      },
      {
        id: tourneySat,
        name: "$250 Saturday Main",
        gameType: "NLH",
        buyIn: 220,
        fee: 30,
        startTime: daysFromNow(1, 12, 0),
        maxPlayers: 120,
        status: "registering",
        blindStructure: standardBlindStructure(),
        lateRegUntilLevel: 8,
        clock: {
          currentLevelIndex: 0,
          levelStartedAt: null,
          pausedAt: null,
          pausedRemainingMs: null,
          isRunning: false,
        },
        registrations: [
          { id: id("reg"), playerName: "Victor Mendez", registeredAt: daysFromNow(-1, 10, 0), checkedIn: false },
          { id: id("reg"), playerName: "Nina Park", registeredAt: daysFromNow(-1, 14, 0), checkedIn: false },
          { id: id("reg"), playerName: "Gabe Santos", phone: "555-0303", registeredAt: todayAt(9, 0), checkedIn: false },
        ],
        notes: "Guaranteed $15K prize pool",
        updatedAt,
      },
      {
        id: tourneySun,
        name: "$100 PLO Sunday",
        gameType: "PLO",
        buyIn: 85,
        fee: 15,
        startTime: daysFromNow(2, 13, 0),
        maxPlayers: 50,
        status: "registering",
        blindStructure: standardBlindStructure(),
        lateRegUntilLevel: 5,
        clock: {
          currentLevelIndex: 0,
          levelStartedAt: null,
          pausedAt: null,
          pausedRemainingMs: null,
          isRunning: false,
        },
        registrations: [
          { id: id("reg"), playerName: "Omar R.", registeredAt: todayAt(11, 0), checkedIn: false },
        ],
        updatedAt,
      },
      {
        id: tourneyWed,
        name: "$60 Midweek Turbo",
        gameType: "NLH",
        buyIn: 50,
        fee: 10,
        startTime: daysFromNow(4, 19, 0),
        maxPlayers: 40,
        status: "registering",
        blindStructure: standardBlindStructure().map((l) => ({
          ...l,
          durationMinutes: 10,
        })),
        lateRegUntilLevel: 4,
        clock: {
          currentLevelIndex: 0,
          levelStartedAt: null,
          pausedAt: null,
          pausedRemainingMs: null,
          isRunning: false,
        },
        registrations: [],
        notes: "Turbo structure — 10-minute levels",
        updatedAt,
      },
    ],
    houseRules: {
      content: `SHOOTERS POKER ROOM — HOUSE RULES

1. PHONES & ELECTRONICS
Phones must be face-down on the table or in your pocket while in a hand. No phone calls at the table. Texting is allowed between hands only. Photography of cards, stacks, or other players is prohibited without floor approval.

2. ENGLISH ONLY
English only at the table while a hand is in progress. Side conversations in other languages are fine between hands. This protects the integrity of the game for all players.

3. MUST-MOVE
When a must-move table is in effect, the next available seat on the main game must be taken. Declining a must-move seat forfeits your place; you may rejoin the waitlist at the bottom.

4. WAITLIST ETIQUETTE
Join the waitlist with your real name. When your name is called, you have 5 minutes to take your seat or you will be skipped. Two skips remove you from the list. One name per player — no holding seats for others without floor approval.

5. COLLUSION & ANGLE SHOOTING
Any form of collusion, soft-play, chip dumping, or angle shooting will result in immediate removal and a possible ban. Soft-playing friends or partners is collusion. Protect your hand; if cards touch the muck they are dead.

6. TIPPING
Tipping dealers and staff is customary and appreciated. Tip when you leave a cash game and when you cash a tournament ticket. There is no obligation, but good service deserves recognition.

7. DRESS CODE
Shooters Poker Room maintains a casual but respectful dress code. No clothing with offensive language or imagery. Shoes required. Management reserves the right to refuse service based on appearance.

8. GENERAL CONDUCT
Treat dealers, floor staff, and fellow players with respect. Abusive language, throwing cards, or damaging equipment will not be tolerated. The floor decision is final on all disputes.

9. BUY-INS & TABLE STAKES
All games are table stakes. You may only play the chips in front of you. Adding chips mid-hand is not allowed. Cash game buy-ins must meet the posted minimum; maximum buy-ins are enforced when posted.

10. TOURNAMENT RULES
Tournament registration closes at the posted late-reg level. All chip races and color-ups are handled by the floor. Breaking tables and balancing are at floor discretion. Blind levels advance on the official Shooters clock.

Questions? Ask the floor. Welcome to Shooters Poker Room — good luck.`,
      updatedAt,
    },
  };
}
