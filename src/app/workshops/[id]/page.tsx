import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import Link from "next/link";
import { connection } from "next/server";
import RegistrationForm from "./RegistrationForm";
import CancelButton from "./CancelButton";

export default async function WorkshopDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await getSession();
  
  if (!session || (session.role !== "manager" && session.role !== "staff")) {
    redirect("/login");
  }

  const { id } = await params;
  const workshopId = parseInt(id);

  const wsResult = await query(`
    SELECT w.id, w.title, w.instructor, w.location, w.schedule_date, w.capacity, w.code,
           t.name as type_name, t.category as type_category,
           (SELECT COUNT(*) FROM registrations r WHERE r.workshop_id = w.id AND r.status = 'active') as registered_count
    FROM workshops w
    JOIN workshop_types t ON w.type_id = t.id
    WHERE w.id = $1
  `, [workshopId]);

  if (wsResult.rowCount === 0) {
    redirect("/");
  }

  const workshop = wsResult.rows[0];
  const registered = parseInt(workshop.registered_count);
  const isFull = registered >= workshop.capacity;

  const rosterResult = await query(`
    SELECT r.id, r.attendee_name, r.attendee_email, r.created_at,
           u.email as booked_by_email
    FROM registrations r
    JOIN registration_history rh ON r.id = rh.registration_id AND rh.action = 'registered'
    JOIN users u ON rh.performed_by = u.id
    WHERE r.workshop_id = $1 AND r.status = 'active'
    ORDER BY r.created_at DESC
  `, [workshopId]);
  
  const roster = rosterResult.rows;

  const auditResult = await query(`
    SELECT rh.id, r.attendee_name, rh.action, rh.action_timestamp,
           u.email as performed_by_email, u.role as performed_by_role
    FROM registration_history rh
    JOIN registrations r ON rh.registration_id = r.id
    JOIN users u ON rh.performed_by = u.id
    WHERE r.workshop_id = $1
    ORDER BY rh.action_timestamp DESC
  `, [workshopId]);
  
  const auditLog = auditResult.rows;

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-6 sm:px-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-800 text-white">
                    {workshop.code}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {workshop.type_category}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">{workshop.title}</h1>
                <p className="mt-2 text-lg text-gray-500">
                  {new Date(workshop.schedule_date).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Capacity</div>
                <div className={`text-2xl font-bold ${isFull ? 'text-red-600' : 'text-blue-600'}`}>
                  {registered} / {workshop.capacity}
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-semibold w-24">Instructor:</span>
                <span>{workshop.instructor}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-semibold w-24">Location:</span>
                <span>{workshop.location}</span>
              </div>
            </div>
          </div>
        </div>

        <RegistrationForm workshopId={workshopId} isFull={isFull} />

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Active Attendees Roster</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked By</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roster.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{r.attendee_name}</div>
                      <div className="text-sm text-gray-500">{r.attendee_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {r.booked_by_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <CancelButton registrationId={r.id} workshopId={workshopId} />
                    </td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No attendees registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Immutable Audit Trail</h3>
            <p className="mt-1 text-sm text-gray-500">Chronological timeline of all operations on this workshop.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLog.map((log) => (
                  <tr key={log.id} className={`${log.action === 'cancelled' ? 'bg-red-50' : 'bg-white'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.action_timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.action === 'registered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 capitalize'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${log.action === 'cancelled' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {log.attendee_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.performed_by_email} <span className="text-gray-400">({log.performed_by_role})</span>
                    </td>
                  </tr>
                ))}
                {auditLog.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No audit history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
