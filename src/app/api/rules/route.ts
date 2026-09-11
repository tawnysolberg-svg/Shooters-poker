import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = readStore();
  return NextResponse.json({ houseRules: store.houseRules });
}

export async function PUT(request: Request) {
  const cookieStore = cookies();
  if (cookieStore.get(ADMIN_COOKIE)?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const content = String(body?.content ?? "");
  const store = await updateStore((s) => {
    s.houseRules = {
      content,
      updatedAt: new Date().toISOString(),
    };
  });
  return NextResponse.json({ ok: true, houseRules: store.houseRules });
}
