import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const pin = String(body?.pin ?? "");
  if (!checkPin(pin)) {
    return NextResponse.json({ ok: false, error: "Invalid PIN" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

export async function GET() {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  const authed = cookieStore.get(ADMIN_COOKIE)?.value === "1";
  return NextResponse.json({ authenticated: authed });
}
