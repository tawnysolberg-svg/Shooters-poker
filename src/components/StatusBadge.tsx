import { statusLabel } from "@/lib/format";

const styles: Record<string, string> = {
  open: "bg-emerald-600/30 text-emerald-300 border-emerald-500/40",
  full: "bg-amber-600/30 text-amber-200 border-amber-500/40",
  closed: "bg-charcoal-light text-cream-dim border-charcoal-soft",
  registering: "bg-sky-600/30 text-sky-200 border-sky-500/40",
  late_reg: "bg-orange-600/30 text-orange-200 border-orange-500/40",
  in_play: "bg-gold/20 text-gold-bright border-gold/40",
  completed: "bg-charcoal-light text-cream-dim border-charcoal-soft",
  cancelled: "bg-red-900/40 text-red-300 border-red-700/40",
  waiting: "bg-felt-mid text-cream border-felt-light",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge border ${styles[status] || styles.closed}`}>
      {statusLabel(status)}
    </span>
  );
}
