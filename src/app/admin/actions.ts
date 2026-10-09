"use server";

import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createUser(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !role) {
    return { error: "All fields are required." };
  }

  if (role !== "manager" && role !== "staff") {
    return { error: "Invalid role." };
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount && existing.rowCount > 0) {
      return { error: "Email already exists." };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
      [email, passwordHash, role]
    );

    revalidatePath("/admin");
    return { success: "User created successfully." };
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred while creating the user." };
  }
}
