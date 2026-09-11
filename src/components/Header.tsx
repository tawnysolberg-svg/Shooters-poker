"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-felt-light/40 bg-felt-dark/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 min-h-[44px]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-charcoal font-black text-lg shadow-glow">
            S
          </span>
          <div className="leading-tight">
            <div className="text-base sm:text-lg font-bold text-cream tracking-wide">
              Shooters Poker Room
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold">
              Live Cardroom
            </div>
          </div>
        </Link>
        <Link
          href="/admin"
          className="rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-cream-dim hover:text-gold min-h-[44px] flex items-center"
        >
          Staff
        </Link>
      </div>
    </header>
  );
}
