import { cookies } from "next/headers";
import { connection } from "next/server";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "super-secret-key-for-workshop";

export type SessionPayload = {
  id: number;
  email: string;
  role: string;
  exp: number;
};

export async function encrypt(payload: SessionPayload): Promise<string> {
  const text = JSON.stringify(payload);
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(SECRET, 'salt', 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return iv.toString("hex") + ":" + encrypted;
}

export async function decrypt(cookieValue: string): Promise<SessionPayload | null> {
  try {
    const parts = cookieValue.split(":");
    if (parts.length !== 2) return null;
    
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const key = crypto.scryptSync(SECRET, 'salt', 32);
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    const payload = JSON.parse(decrypted) as SessionPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(user: { id: number; email: string; role: string }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionData = await encrypt({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: expiresAt.getTime(),
  });

  const cookieStore = await cookies();
  cookieStore.set("session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
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
