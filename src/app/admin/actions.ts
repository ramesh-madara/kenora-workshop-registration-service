"use server";

import { query } from "@/lib/db";

import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createUser(prevState: any, formData: FormData) {
  const session = await getSession();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!session || session.role !== "admin") {
    return { error: `Unauthorized. Session: ${JSON.stringify(session)}, Cookie string: ${sessionCookie || 'missing'}` };
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

    await query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
      [email, password, role]
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
    return { error: `Unauthorized. Session data: ${JSON.stringify(session)}` };
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
      await query(
        'UPDATE users SET email = $1, password = $2, role = $3 WHERE id = $4',
        [email, password, role, id]
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
    throw new Error(`Unauthorized. Session data: ${JSON.stringify(session)}`);
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
    throw new Error(`Unauthorized. Session data: ${JSON.stringify(session)}`);
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
