import { cookies } from "next/headers";

const COOKIE_NAME = "opsbrain_access";

export function getAppAccessSecret(): string | undefined {
  return process.env.OPSBRAIN_ACCESS_SECRET;
}

export function isAppAccessRequired(): boolean {
  return Boolean(getAppAccessSecret());
}

export async function assertAppAccess(): Promise<void> {
  const secret = getAppAccessSecret();
  if (!secret) return;
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token !== secret) {
    throw new Error("גישה נדחתה — הזן סיסמת גישה בהגדרות");
  }
}

export async function setAppAccessCookie(secret: string): Promise<boolean> {
  const expected = getAppAccessSecret();
  if (!expected || secret !== expected) return false;
  const jar = await cookies();
  jar.set(COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function clearAppAccessCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function hasAppAccess(): Promise<boolean> {
  if (!isAppAccessRequired()) return true;
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === getAppAccessSecret();
}
