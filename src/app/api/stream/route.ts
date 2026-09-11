import { readStore } from "@/lib/store";
import { autoAdvanceIfNeeded, getClockSnapshot } from "@/lib/clock";
import { updateStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        if (closed) return;
        try {
          await updateStore((s) => {
            for (const t of s.tournaments) {
              if (t.status === "in_play" && t.clock.isRunning) {
                t.clock = autoAdvanceIfNeeded(t.clock, t.blindStructure);
              }
            }
          });
          const store = readStore();
          const payload = {
            version: store.version,
            serverTime: new Date().toISOString(),
            cashGames: store.cashGames,
            waitlist: store.waitlist.filter((w) => w.status === "waiting"),
            tournaments: store.tournaments.map((t) => ({
              id: t.id,
              name: t.name,
              status: t.status,
              registrations: t.registrations.length,
              checkedIn: t.registrations.filter((r) => r.checkedIn).length,
              clock: getClockSnapshot(t),
            })),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // ignore send errors when closed
        }
      };

      await send();
      const interval = setInterval(send, 1000);

      const cleanup = () => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // Keep alive ~5 min then close (client reconnects)
      setTimeout(cleanup, 5 * 60 * 1000);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
