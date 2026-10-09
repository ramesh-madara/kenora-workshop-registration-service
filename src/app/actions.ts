"use server";

import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const res = await query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
    const user = res.rows[0];

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return { error: "Invalid email or password." };
    }

    await createSession({
      id: user.id,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred." };
  }

  const res = await query('SELECT role FROM users WHERE email = $1', [email]);
  if (res.rows[0].role === 'admin') {
    redirect("/admin");
  } else {
    redirect("/");
  }
}
