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
  const sessionCookie = cookieStore.get("session_token")?.value;
  
  console.log("[getSession] Read raw cookie from header:", sessionCookie);
  
  if (!sessionCookie) return null;
  
  const decrypted = await decrypt(sessionCookie);
  console.log("[getSession] Decrypted payload:", decrypted);
  return decrypted;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
}
