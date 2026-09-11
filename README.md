# Shooters Poker Room

Mobile-first live cardroom web app for **Shooters Poker Room** (also branded Shooters Poker): cash games, waitlists, tournaments, door check-in, house rules, staff admin, and a server-synced tournament clock.

## Quick start

```bash
cd shooters-poker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Admin PIN

Staff admin is PIN-gated: **`2468`**

After unlock, a session cookie keeps you signed in for 12 hours. Use **Staff** in the header or go to `/admin`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Today — schedule overview (cash + tournaments + private teaser) |
| `/cash` | Live cash tables, join waitlist |
| `/waitlist` | Per-game waitlists; staff seat/skip/remove when admin |
| `/tournaments` | Today + upcoming tournaments |
| `/tournaments/[id]` | Details, register/unregister, live clock if in play |
| `/private` | Upcoming private games (not on public cash floor) |
| `/book` | Request / book a private table |
| `/check-in` | Door check-in — search/tap registered players |
| `/rules` | House rules (admin can edit) |
| `/admin` | PIN-gated staff console (incl. private games & bookings) |
| `/tv` | Display-only tournament clock |

## Data persistence

Shared server-side store lives in `data/store.json`. API routes read/write this file so:

- Edits survive refresh and server restart
- Multiple browser tabs stay in sync via polling (and optional SSE at `/api/stream`)

Seed data loads automatically on first run (cash tables, waitlists, an in-play tournament mid-level, upcoming events, private games, booking requests, house rules).

Reset seed (dev):

```bash
curl -X POST http://localhost:3000/api/store -H 'content-type: application/json' -d '{"action":"reset"}'
```

## Tournament clock

- Remaining time is derived from **server timestamps** (not client-only timers), so a sleeping tab does not drift the official clock
- Shows current blinds, next blinds, level, player count
- Admin: start / pause / resume / skip level
- Visual flash when a level ends
- Optional `/tv` full-screen display

## Deploy on Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npm run build` · Output: default
5. Deploy

**Note:** Vercel’s serverless filesystem is ephemeral. For production persistence, swap `data/store.json` for a durable store (Vercel Blob, KV, Postgres, etc.) using the same `AppStore` shape in `src/lib/types.ts`. For a single long-lived Node host (Railway, Fly, VPS), the JSON file works as-is if the `data/` directory is on a persistent volume.

## Stack

- Next.js 14 App Router + TypeScript + Tailwind CSS
- JSON file persistence under `data/`
- Polling for live clock / waitlist updates

## Out of scope

No payments, SMS, wallets, or real-money features.
