export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatBlinds(sb: number, bb: number, ante?: number): string {
  const base = `$${sb}/$${bb}`;
  if (ante && ante > 0) return `${base} ($${ante} ante)`;
  return base;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function isSameDay(iso: string, ref = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    open: "Open",
    full: "Full",
    closed: "Closed",
    registering: "Registering",
    late_reg: "Late Reg",
    in_play: "In Play",
    completed: "Completed",
    cancelled: "Cancelled",
    waiting: "Waiting",
    seated: "Seated",
    skipped: "Skipped",
    removed: "Removed",
    confirmed: "Confirmed",
    pending: "Pending",
    declined: "Declined",
  };
  return map[status] || status;
}
