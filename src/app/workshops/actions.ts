"use server";

import { query } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function upsertWorkshop(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "manager") {
    return { error: "Unauthorized. Only managers can edit workshops." };
  }

  const id = formData.get("id") as string;
  const type_id = parseInt(formData.get("type_id") as string);
  const code = formData.get("code") as string;
  const title = formData.get("title") as string;
  const instructor = formData.get("instructor") as string;
  const schedule_date = formData.get("schedule_date") as string;
  const capacity = parseInt(formData.get("capacity") as string);
  const duration_hours = parseInt(formData.get("duration_hours") as string);
  const duration_minutes = parseInt(formData.get("duration_minutes") as string);
  const duration = (duration_hours * 60) + duration_minutes;
  const location = formData.get("location") as string;
  const status = formData.get("status") as string;

  if (!type_id || !code || !title || !instructor || !schedule_date || !capacity || !location || !status || isNaN(duration)) {
    return { error: "All fields are required." };
  }

  if (capacity < 1) {
    return { error: "Capacity must be at least 1." };
  }

  try {
    if (id) {
      // Update
      await query(
        `UPDATE workshops 
         SET type_id = $1, code = $2, title = $3, instructor = $4, schedule_date = $5, duration = $6, capacity = $7, location = $8, status = $9
         WHERE id = $10`,
        [type_id, code, title, instructor, schedule_date, duration, capacity, location, status, parseInt(id)]
      );
      
      await query(
        "INSERT INTO system_audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)",
        [session.id, "UPDATE_WORKSHOP", "WORKSHOP", parseInt(id), `Updated workshop ${code}: ${title}`]
      );
    } else {
      // Create
      const res = await query(
        `INSERT INTO workshops (type_id, code, title, instructor, schedule_date, duration, capacity, location, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [type_id, code, title, instructor, schedule_date, duration, capacity, location, status]
      );
      
      const newWorkshopId = res.rows[0].id;
      
      await query(
        "INSERT INTO system_audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)",
        [session.id, "CREATE_WORKSHOP", "WORKSHOP", newWorkshopId, `Created workshop ${code}: ${title}`]
      );
    }
  } catch (err: any) {
    if (err.code === '23505') {
      return { error: "A workshop with this code already exists." };
    }
    return { error: err.message || "An error occurred while saving." };
  }

  revalidatePath("/");
  redirect("/");
}

export async function deleteWorkshop(id: number) {
  const session = await getSession();
  if (!session || session.role !== "manager") {
    throw new Error("Unauthorized");
  }

  try {
    // Check for active registrations before deleting
    const checkRes = await query("SELECT COUNT(*) FROM registrations WHERE workshop_id = $1 AND status = 'active'", [id]);
    if (parseInt(checkRes.rows[0].count) > 0) {
      throw new Error("Cannot delete a workshop with active registrations. Cancel them first.");
    }
    
    // Hard delete is okay here since there are no active dependencies, but we must delete history first
    await query("DELETE FROM registration_history WHERE registration_id IN (SELECT id FROM registrations WHERE workshop_id = $1)", [id]);
    await query("DELETE FROM registrations WHERE workshop_id = $1", [id]);
    await query("DELETE FROM workshops WHERE id = $1", [id]);
    
    await query(
      "INSERT INTO system_audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)",
      [session.id, "DELETE_WORKSHOP", "WORKSHOP", id, `Deleted workshop ID ${id}`]
    );
    
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || "Failed to delete workshop.");
  }
}
