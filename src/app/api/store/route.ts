import { NextResponse } from "next/server";
import { readStore, resetStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = readStore();
  return NextResponse.json({
    ...store,
    serverTime: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body?.action === "reset") {
    const store = resetStore();
    return NextResponse.json({ ok: true, store });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
