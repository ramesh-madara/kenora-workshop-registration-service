"use server";

import { query, withTransaction } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function registerAttendee(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "manager" && session.role !== "staff")) {
    return { error: "Unauthorized" };
  }

  const workshopId = parseInt(formData.get("workshop_id") as string);
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!workshopId || !name || !email) {
    return { error: "All fields are required." };
  }

  try {
    const status = await withTransaction(async (client) => {
      // 1. Lock the workshop row to prevent concurrent overbooking
      const wsRes = await client.query(
        "SELECT capacity FROM workshops WHERE id = $1 FOR UPDATE",
        [workshopId]
      );
      
      if (wsRes.rowCount === 0) {
        throw new Error("Workshop not found");
      }
      
      const capacity = wsRes.rows[0].capacity;

      // 2. Count active registrations
      const countRes = await client.query(
        "SELECT COUNT(*) as count FROM registrations WHERE workshop_id = $1 AND status = 'active'",
        [workshopId]
      );
      
      const activeCount = parseInt(countRes.rows[0].count);
      const isFull = activeCount >= capacity;
      const newStatus = isFull ? 'waitlisted' : 'active';
      const actionType = isFull ? 'waitlisted' : 'registered';

      // 3. Insert Registration
      const regRes = await client.query(
        "INSERT INTO registrations (workshop_id, attendee_name, attendee_email, status) VALUES ($1, $2, $3, $4) RETURNING id",
        [workshopId, name, email, newStatus]
      );
      
      const registrationId = regRes.rows[0].id;

      // 4. Insert Audit Log
      await client.query(
        "INSERT INTO registration_history (registration_id, action, performed_by) VALUES ($1, $2, $3)",
        [registrationId, actionType, session.id]
      );

      return newStatus;
    });

    revalidatePath(`/workshops/${workshopId}`);
    return { success: status === 'waitlisted' ? `${name} has been added to the waitlist.` : `Registration confirmed for ${name}.` };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function cancelRegistration(registrationId: number, workshopId: number) {
  const session = await getSession();
  if (!session || (session.role !== "manager" && session.role !== "staff")) {
    throw new Error("Unauthorized");
  }

  try {
    await withTransaction(async (client) => {
      // 0. Lock the workshop to prevent race conditions during waitlist promotion
      await client.query("SELECT id FROM workshops WHERE id = $1 FOR UPDATE", [workshopId]);

      // 1. Update Registration Status
      const regRes = await client.query(
        "UPDATE registrations SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'active' RETURNING id",
        [registrationId]
      );
      
      if (regRes.rowCount === 0) {
        throw new Error("Registration not found or already cancelled.");
      }

      // 2. Insert Audit Log
      await client.query(
        "INSERT INTO registration_history (registration_id, action, performed_by) VALUES ($1, 'cancelled', $2)",
        [registrationId, session.id]
      );

      // 3. Promote next from waitlist
      const waitlistRes = await client.query(
        "SELECT id, attendee_name FROM registrations WHERE workshop_id = $1 AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1 FOR UPDATE",
        [workshopId]
      );

      if (waitlistRes.rowCount && waitlistRes.rowCount > 0) {
        const promotedId = waitlistRes.rows[0].id;
        
        await client.query(
          "UPDATE registrations SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [promotedId]
        );
        
        await client.query(
          "INSERT INTO registration_history (registration_id, action, performed_by) VALUES ($1, 'promoted', $2)",
          [promotedId, session.id]
        );
      }
    });

    revalidatePath(`/workshops/${workshopId}`);
    return { success: true };
  } catch (err: any) {
    throw new Error(err.message || "An unexpected error occurred.");
  }
}
