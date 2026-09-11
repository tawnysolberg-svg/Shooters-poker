"use client";

import Link from "next/link";
import { useStore } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatMoney, isSameDay } from "@/lib/format";
import { getClockSnapshot } from "@/lib/clock";

export default function TournamentsPage() {
  const { data, loading } = useStore(4000);

  if (loading && !data) {
    return <div className="h-40 animate-pulse rounded-2xl bg-charcoal-mid" />;
  }
  if (!data) return null;

  const today = data.tournaments.filter(
    (t) => isSameDay(t.startTime) || ["in_play", "late_reg"].includes(t.status)
  );
  const upcoming = data.tournaments.filter(
    (t) => !isSameDay(t.startTime) && t.status === "registering" && new Date(t.startTime) > new Date()
  );
  const rest = data.tournaments.filter(
    (t) => !today.includes(t) && !upcoming.includes(t)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Tournaments</h1>
        <p className="mt-1 text-sm text-cream-muted">Shooters Poker Room schedule</p>
      </div>

      <Section title="Today">
        {today.length === 0 && <Empty />}
        {today.map((t) => (
          <TourneyCard key={t.id} t={t} />
        ))}
      </Section>

      <Section title="Upcoming this week">
        {upcoming.length === 0 && <Empty />}
        {upcoming.map((t) => (
          <TourneyCard key={t.id} t={t} />
        ))}
      </Section>

      {rest.length > 0 && (
        <Section title="Other">
          {rest.map((t) => (
            <TourneyCard key={t.id} t={t} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-cream">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Empty() {
  return <p className="text-sm text-cream-dim">Nothing scheduled.</p>;
}

function TourneyCard({ t }: { t: import("@/lib/types").Tournament }) {
  const snap = getClockSnapshot(t);
  return (
    <Link href={`/tournaments/${t.id}`} className="card block active:scale-[0.99] transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-lg text-cream">{t.name}</div>
          <div className="mt-1 text-sm text-cream-muted">
            {t.gameType} · Buy-in {formatMoney(t.buyIn)}
            {t.fee ? ` + ${formatMoney(t.fee)}` : ""}
          </div>
          <div className="mt-1 text-sm text-cream-dim">{formatDateTime(t.startTime)}</div>
          <div className="mt-2 text-sm">
            <span className="font-bold text-gold tabular-nums">{t.registrations.length}</span>
            <span className="text-cream-dim"> / {t.maxPlayers} registered</span>
            {t.status === "in_play" && (
              <span className="text-cream-muted">
                {" "}
                · L{snap.levelNumber} · {snap.remainingDisplay}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={t.status} />
      </div>
    </Link>
  );
}
