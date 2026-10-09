import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";

export const instant = false;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const session = await getSession();
  
  console.log("[AdminLayout] Evaluated session:", session);

  if (!session || session.role !== "admin") {
    console.log("[AdminLayout] Redirecting to /login because session is invalid or not admin.");
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 tracking-tight">Admin Console</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 capitalize">
                Super {session.role}
              </span>
              <span className="text-sm text-gray-500 hidden sm:block">{session.email}</span>
              <a href="/logout" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
