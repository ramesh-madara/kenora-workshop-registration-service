"use server";

import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createUser(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: `Unauthorized. Session data: ${JSON.stringify(session)}` };
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

export async function updateUser(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!id || !email || !role) {
    return { error: "Required fields are missing." };
  }

  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await query(
        'UPDATE users SET email = $1, password_hash = $2, role = $3 WHERE id = $4',
        [email, passwordHash, role, id]
      );
    } else {
      await query(
        'UPDATE users SET email = $1, role = $2 WHERE id = $3',
        [email, role, id]
      );
    }

    revalidatePath("/admin");
    return { success: "User updated successfully." };
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred while updating the user." };
  }
}

export async function deleteUser(id: number) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    throw new Error("Failed to delete user. They may have related records.");
  }
}

export async function toggleUserStatus(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }


  if (session.id === id) {
    throw new Error("Cannot deactivate your own account.");
  }

  try {
    await query('UPDATE users SET is_active = $1 WHERE id = $2', [isActive, id]);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error(err);
    throw new Error("Failed to update user status.");
  }
}
