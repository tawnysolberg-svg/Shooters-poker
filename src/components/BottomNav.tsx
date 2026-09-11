"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Today", icon: "📅" },
  { href: "/cash", label: "Cash", icon: "💵" },
  { href: "/waitlist", label: "Waitlist", icon: "📋" },
  { href: "/tournaments", label: "Tourneys", icon: "🏆" },
  { href: "/private", label: "Private", icon: "🔒" },
  { href: "/rules", label: "Rules", icon: "📜" },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/tv") || pathname?.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-felt-light/30 bg-charcoal/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-3xl justify-around px-0.5 py-1">
        {links.map((l) => {
          const active =
            l.href === "/"
              ? pathname === "/"
              : pathname === l.href || pathname?.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-2 text-[10px] sm:text-[11px] font-semibold min-h-[56px] justify-center transition ${
                active ? "text-gold bg-felt/50" : "text-cream-dim hover:text-cream"
              }`}
            >
              <span className="text-base sm:text-lg leading-none" aria-hidden>
                {l.icon}
              </span>
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
