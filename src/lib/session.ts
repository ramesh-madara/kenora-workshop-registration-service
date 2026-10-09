import { cookies } from "next/headers";
import { connection } from "next/server";

export type SessionPayload = {
  id: number;
  email: string;
  role: string;
};

export async function encrypt(payload: SessionPayload): Promise<string> {
  return JSON.stringify(payload);
}

export async function decrypt(cookieValue: string): Promise<SessionPayload | null> {
  try {
    const decoded = decodeURIComponent(cookieValue);
    return JSON.parse(decoded) as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(user: { id: number; email: string; role: string }) {
  const sessionData = await encrypt({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return sessionData;
}

export async function getSession() {
  await connection();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  
  return await decrypt(sessionCookie);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
