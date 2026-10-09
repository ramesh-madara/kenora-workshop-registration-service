"use server";

import { query } from "@/lib/db";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let redirectUrl = "";

  try {
    const res = await query('SELECT id, email, password, role, is_active FROM users WHERE email = $1', [email]);
    const user = res.rows[0];

    if (!user) {
      return { error: "Invalid email or password." };
    }
    
    if (!user.is_active) {
      return { error: "Your account has been deactivated. Please contact an administrator." };
    }

    const isValid = password === user.password;
    if (!isValid) {
      return { error: "Invalid email or password." };
    }

    // Determine redirect url BEFORE setting session
    redirectUrl = user.role === 'admin' ? "/admin" : "/";

    await createSession({
      id: user.id,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred." };
  }

  // 3. MUST be called outside the try/catch block, with no async work in between!
  if (redirectUrl) {
    redirect(redirectUrl);
  }
}
