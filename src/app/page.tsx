import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import Link from "next/link";
import { connection } from "next/server";

import FilterBar from "./FilterBar";

export const instant = false;

export default async function DashboardPage(props: { searchParams: Promise<Record<string, string>> }) {
  await connection();
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let sql = `
    SELECT w.id, w.title, w.instructor, w.location, w.schedule_date, w.capacity,
           t.name as type_name, t.category as type_category,
           (SELECT COUNT(*) FROM registrations r WHERE r.workshop_id = w.id AND r.status = 'active') as registered_count
    FROM workshops w
    JOIN workshop_types t ON w.type_id = t.id
    WHERE 1=1
  `;
  
  const values: any[] = [];
  let paramIdx = 1;

  if (searchParams.fromDate) {
    sql += ` AND w.schedule_date >= $${paramIdx++}`;
    values.push(searchParams.fromDate);
  }
  if (searchParams.toDate) {
    sql += ` AND w.schedule_date <= $${paramIdx++}`;
    values.push(searchParams.toDate + " 23:59:59");
  }
  if (searchParams.status) {
    sql += ` AND w.status = $${paramIdx++}`;
    values.push(searchParams.status);
  }
  if (searchParams.location) {
    sql += ` AND w.location = $${paramIdx++}`;
    values.push(searchParams.location);
  }

  sql += ` ORDER BY w.schedule_date ASC`;

  const workshopsResult = await query(sql, values);
  let workshops = workshopsResult.rows;

  if (searchParams.availableOnly === "true") {
    workshops = workshops.filter(w => parseInt(w.registered_count) < w.capacity);
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-12 text-brand-text">
      <nav className="bg-brand-surface border-b border-brand-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-brand-text tracking-tight">WorkshopManager</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent text-brand-bg capitalize">
                {session.role}
              </span>
              <span className="text-sm text-brand-text-muted hidden sm:block">{session.email}</span>
              <a href="/logout" className="text-sm font-medium text-brand-link hover:text-brand-text transition-colors">
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-text">Active Workshops</h1>
            <p className="mt-1 text-sm text-brand-text-muted">Manage and monitor upcoming sessions across all locations.</p>
          </div>
          {(session.role === "manager" || session.role === "admin") && (
            <Link 
              href="/workshops/new" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
            >
              Create New Workshop
            </Link>
          )}
        </div>
        
        <FilterBar currentParams={searchParams} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => {
            const registered = parseInt(workshop.registered_count);
            const isFull = registered >= workshop.capacity;
            const progress = Math.min((registered / workshop.capacity) * 100, 100);
            
            return (
              <div key={workshop.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {workshop.type_category}
                    </span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {workshop.type_name}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{workshop.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(workshop.schedule_date).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {workshop.instructor}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {workshop.location}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</span>
                      <span className={`text-xs font-bold ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
                        {registered} / {workshop.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-blue-500'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 mt-auto">
                  <Link 
                    href={`/workshops/${workshop.id}`} 
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    View Roster & Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {workshops.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workshops</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new workshop session.</p>
          </div>
        )}
      </main>
    </div>
  );
}
