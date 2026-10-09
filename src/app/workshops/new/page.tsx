import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import Link from "next/link";
import { connection } from "next/server";
import WorkshopForm from "../WorkshopForm";

export const instant = false;

export default async function NewWorkshopPage() {
  await connection();
  const session = await getSession();
  
  if (!session || session.role !== "manager") {
    redirect("/");
  }

  const typesResult = await query("SELECT id, name, category FROM workshop_types ORDER BY category, name");

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition-colors">
                &larr; Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {session.role}
              </span>
              <span className="text-sm text-gray-500 hidden sm:block">{session.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <WorkshopForm types={typesResult.rows} />
      </main>
    </div>
  );
}
