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

    const sessionData = await createSession({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const roleRes = await query('SELECT role FROM users WHERE email = $1', [email]);
    if (roleRes.rows[0].role === 'admin') {
      return { success: true, redirectUrl: "/admin", sessionData };
    } else {
      return { success: true, redirectUrl: "/", sessionData };
    }
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred." };
  }
}
