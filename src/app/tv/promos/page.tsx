"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { PromoItem } from "@/lib/types";

const DEFAULT_SLIDE_SECONDS = 10;

export default function TvPromosPage() {
  const [playlist, setPlaylist] = useState<PromoItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/promos", { cache: "no-store" });
        const json = await res.json();
        if (Array.isArray(json.playlist) && json.playlist.length) {
          setPlaylist(json.playlist);
        }
      } catch {
        /* keep empty */
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const advance = useCallback(() => {
    setIndex((i) => (playlist.length ? (i + 1) % playlist.length : 0));
  }, [playlist.length]);

  const item = playlist[index] ?? null;

  useEffect(() => {
    if (!item || item.type === "video") return;
    const ms = (item.durationSeconds || DEFAULT_SLIDE_SECONDS) * 1000;
    const id = setTimeout(advance, ms);
    return () => clearTimeout(id);
  }, [item, index, advance]);

  return (
    <div className="fixed inset-0 z-50 bg-felt-dark felt-bg flex flex-col">
      <div className="absolute top-4 left-0 right-0 z-10 text-center pointer-events-none">
        <div className="text-gold text-sm uppercase tracking-[0.35em] font-bold">
          Shooters Poker Room
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        {!item ? (
          <div className="text-cream-muted text-2xl text-center">
            No promos yet
          </div>
        ) : item.type === "video" && item.url ? (
          <video
            key={item.id}
            className="max-h-full max-w-full object-contain"
            src={item.url}
            autoPlay
            muted
            playsInline
            onEnded={advance}
          />
        ) : item.type === "image" && item.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.id}
            src={item.url}
            alt={item.title || "Promo"}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div
            key={item.id}
            className="w-full max-w-5xl rounded-3xl border border-gold/40 bg-felt/60 px-8 py-16 sm:px-16 sm:py-24 text-center shadow-glow"
          >
            {item.subtitle && (
              <div className="text-gold text-lg sm:text-2xl uppercase tracking-[0.25em] font-semibold mb-4">
                {item.subtitle}
              </div>
            )}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-cream leading-tight">
              {item.title}
            </h1>
            {item.body && (
              <p className="mt-8 text-xl sm:text-3xl text-cream-muted font-medium">
                {item.body}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 text-xs text-cream-dim">
        <Link href="/tv" className="hover:text-gold pointer-events-auto">
          Clock
        </Link>
        {playlist.length > 0 && (
          <span className="tabular-nums">
            {index + 1}/{playlist.length}
          </span>
        )}
      </div>
    </div>
  );
}
