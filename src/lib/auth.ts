import { cookies } from "next/headers";

export const ADMIN_PIN = "2468";
export const ADMIN_COOKIE = "shooters_admin";

export function isAdminAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    return cookieStore.get(ADMIN_COOKIE)?.value === "1";
  } catch {
    return false;
  }
}

export function checkPin(pin: string): boolean {
  return pin === ADMIN_PIN;
}
