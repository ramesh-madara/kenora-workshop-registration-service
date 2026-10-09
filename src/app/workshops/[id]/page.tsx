import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import Link from "next/link";
import { connection } from "next/server";
import RegistrationForm from "./RegistrationForm";
import CancelButton from "./CancelButton";
import AuditModal from "./AuditModal";

export const instant = false;

export default async function WorkshopDetailsPage(props: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<Record<string, string | undefined>>
}) {
  await connection();
  const session = await getSession();
  
  if (!session || (session.role !== "manager" && session.role !== "staff")) {
    redirect("/login");
  }

  const { id } = await props.params;
  const searchParams = await props.searchParams;
  
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


  const page = parseInt(searchParams.page || "1") || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = searchParams.search || "";
  const sort = searchParams.sort || "created_at";
  const order = searchParams.order === "asc" ? "asc" : "desc";

  let rosterQuery = `
    SELECT r.id, r.attendee_name, r.attendee_email, r.created_at, r.status,
           u.email as booked_by_email,
           COUNT(*) OVER() as total_count
    FROM registrations r
    JOIN registration_history rh ON r.id = rh.registration_id AND rh.action IN ('registered', 'waitlisted')
    JOIN users u ON rh.performed_by = u.id
    WHERE r.workshop_id = $1 AND r.status = 'active'
  `;
  const rosterValues: any[] = [workshopId];
  let paramIdx = 2;

  if (search) {
    rosterQuery += ` AND (r.attendee_name ILIKE $${paramIdx} OR r.attendee_email ILIKE $${paramIdx})`;
    rosterValues.push(`%${search}%`);
    paramIdx++;
  }

  const sortMap: Record<string, string> = {
    'attendee_name': 'r.attendee_name',
    'attendee_email': 'r.attendee_email',
    'booked_by_email': 'u.email',
    'created_at': 'r.created_at',
  };
  const sortCol = sortMap[sort] || sortMap['created_at'];
  rosterQuery += ` ORDER BY ${sortCol} ${order === 'asc' ? 'ASC' : 'DESC'} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  rosterValues.push(limit, offset);

  const rosterResult = await query(rosterQuery, rosterValues);
  const roster = rosterResult.rows;
  const totalRosterCount = roster.length > 0 ? parseInt(roster[0].total_count) : 0;
  const totalPages = Math.ceil(totalRosterCount / limit);


  const wPage = parseInt(searchParams.w_page || "1") || 1;
  const wLimit = 10;
  const wOffset = (wPage - 1) * wLimit;
  const wSearch = searchParams.w_search || "";
  const wSort = searchParams.w_sort || "created_at";
  const wOrder = searchParams.w_order === "asc" ? "asc" : "desc";

  let waitlistQuery = `
    SELECT r.id, r.attendee_name, r.attendee_email, r.created_at, r.status,
           u.email as booked_by_email,
           COUNT(*) OVER() as total_count
    FROM registrations r
    JOIN registration_history rh ON r.id = rh.registration_id AND rh.action = 'waitlisted'
    JOIN users u ON rh.performed_by = u.id
    WHERE r.workshop_id = $1 AND r.status = 'waitlisted'
  `;
  const wValues: any[] = [workshopId];
  let wIdx = 2;

  if (wSearch) {
    waitlistQuery += ` AND (r.attendee_name ILIKE $${wIdx} OR r.attendee_email ILIKE $${wIdx})`;
    wValues.push(`%${wSearch}%`);
    wIdx++;
  }

  const wSortCol = sortMap[wSort] || sortMap['created_at'];
  waitlistQuery += ` ORDER BY ${wSortCol} ${wOrder === 'asc' ? 'ASC' : 'DESC'} LIMIT $${wIdx++} OFFSET $${wIdx++}`;
  wValues.push(wLimit, wOffset);

  const waitlistResult = await query(waitlistQuery, wValues);
  const waitlist = waitlistResult.rows;
  const totalWaitlistCount = waitlist.length > 0 ? parseInt(waitlist[0].total_count) : 0;
  const totalWaitlistPages = Math.ceil(totalWaitlistCount / wLimit);


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

  const workshopAuditResult = await query(`
    SELECT l.id, l.action, l.details, l.created_at,
           u.email as performed_by_email, u.role as performed_by_role
    FROM system_audit_logs l
    JOIN users u ON l.user_id = u.id
    WHERE l.entity_type = 'WORKSHOP' AND l.entity_id = $1
    ORDER BY l.created_at DESC
  `, [workshopId]);
  const workshopAuditLog = workshopAuditResult.rows;


  const getSortLink = (column: string, isWaitlist: boolean = false) => {
    const currentSort = isWaitlist ? wSort : sort;
    const currentOrder = isWaitlist ? wOrder : order;
    const nextOrder = (currentSort === column && currentOrder === 'asc') ? 'desc' : 'asc';
    
    const params = new URLSearchParams(searchParams as any);
    if (isWaitlist) {
      params.set('w_sort', column);
      params.set('w_order', nextOrder);
    } else {
      params.set('sort', column);
      params.set('order', nextOrder);
    }
    return `?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight hover:text-brand-primary transition-colors">
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
              <div className="text-right flex flex-col items-end gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Capacity</div>
                  <div className={`text-2xl font-bold ${isFull ? 'text-red-600' : 'text-brand-primary'}`}>
                    {registered} / {workshop.capacity}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {session.role === "manager" && (
                    <Link 
                      href={`/workshops/${workshopId}/edit`}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                    >
                      Edit Workshop
                    </Link>
                  )}
                  <AuditModal auditLog={auditLog} workshopAuditLog={workshopAuditLog} />
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

        <div className="mt-8 flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="w-full lg:w-1/3 sticky top-24">
            <RegistrationForm 
              workshopId={workshopId} 
              isFull={isFull} 
              title={workshop.title}
              code={workshop.code}
              capacity={workshop.capacity}
              registeredCount={registered}
            />
          </div>

          <div className="w-full lg:w-2/3 space-y-8">
            

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Active Attendees Roster</h3>
                <form method="GET" className="flex w-full sm:w-auto">
                  <input type="hidden" name="sort" value={sort} />
                  <input type="hidden" name="order" value={order} />
                  <input type="hidden" name="w_page" value={wPage} />
                  <input type="hidden" name="w_sort" value={wSort} />
                  <input type="hidden" name="w_order" value={wOrder} />
                  <input type="hidden" name="w_search" value={wSearch} />
                  <input 
                    type="text" 
                    name="search" 
                    defaultValue={search}
                    placeholder="Search active roster..." 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  />
                  <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-brand-primary-hover">
                    Search
                  </button>
                  {search && (
                    <Link href={`?sort=${sort}&order=${order}&w_page=${wPage}&w_sort=${wSort}&w_order=${wOrder}&w_search=${wSearch}`} className="ml-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg flex items-center">
                      Clear
                    </Link>
                  )}
                </form>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Link href={getSortLink('attendee_name', false)} className="hover:text-brand-primary">
                          Attendee {sort === 'attendee_name' && (order === 'asc' ? '↑' : '↓')}
                        </Link>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Link href={getSortLink('booked_by_email', false)} className="hover:text-brand-primary">
                          Booked By {sort === 'booked_by_email' && (order === 'asc' ? '↑' : '↓')}
                        </Link>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Link href={getSortLink('created_at', false)} className="hover:text-brand-primary">
                          Booked Date {sort === 'created_at' && (order === 'asc' ? '↑' : '↓')}
                        </Link>
                      </th>
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
                          {search ? 'No attendees found matching your search.' : 'No active attendees.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{offset + 1}</span> to <span className="font-medium">{Math.min(offset + limit, totalRosterCount)}</span> of <span className="font-medium">{totalRosterCount}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      href={`?page=${Math.max(page - 1, 1)}&sort=${sort}&order=${order}&search=${search}&w_page=${wPage}&w_sort=${wSort}&w_order=${wOrder}&w_search=${wSearch}`}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${page <= 1 ? 'border-gray-200 text-gray-400 pointer-events-none' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Previous
                    </Link>
                    <Link 
                      href={`?page=${Math.min(page + 1, totalPages)}&sort=${sort}&order=${order}&search=${search}&w_page=${wPage}&w_sort=${wSort}&w_order=${wOrder}&w_search=${wSearch}`}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${page >= totalPages ? 'border-gray-200 text-gray-400 pointer-events-none' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Next
                    </Link>
                  </div>
                </div>
              )}
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Waitlist</h3>
                <form method="GET" className="flex w-full sm:w-auto">
                  <input type="hidden" name="page" value={page} />
                  <input type="hidden" name="sort" value={sort} />
                  <input type="hidden" name="order" value={order} />
                  <input type="hidden" name="search" value={search} />
                  <input type="hidden" name="w_sort" value={wSort} />
                  <input type="hidden" name="w_order" value={wOrder} />
                  <input 
                    type="text" 
                    name="w_search" 
                    defaultValue={wSearch}
                    placeholder="Search waitlist..." 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-l-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  />
                  <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-brand-primary-hover">
                    Search
                  </button>
                  {wSearch && (
                    <Link href={`?w_sort=${wSort}&w_order=${wOrder}&page=${page}&sort=${sort}&order=${order}&search=${search}`} className="ml-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg flex items-center">
                      Clear
                    </Link>
                  )}
                </form>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Link href={getSortLink('attendee_name', true)} className="hover:text-brand-primary">
                          Waitlisted {wSort === 'attendee_name' && (wOrder === 'asc' ? '↑' : '↓')}
                        </Link>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Link href={getSortLink('booked_by_email', true)} className="hover:text-brand-primary">
                          Added By {wSort === 'booked_by_email' && (wOrder === 'asc' ? '↑' : '↓')}
                        </Link>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Link href={getSortLink('created_at', true)} className="hover:text-brand-primary">
                          Waitlist Date {wSort === 'created_at' && (wOrder === 'asc' ? '↑' : '↓')}
                        </Link>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {waitlist.map((r) => (
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
                    {waitlist.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                          {wSearch ? 'No waitlisted attendees found.' : 'Waitlist is empty.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalWaitlistPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{wOffset + 1}</span> to <span className="font-medium">{Math.min(wOffset + wLimit, totalWaitlistCount)}</span> of <span className="font-medium">{totalWaitlistCount}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      href={`?w_page=${Math.max(wPage - 1, 1)}&w_sort=${wSort}&w_order=${wOrder}&w_search=${wSearch}&page=${page}&sort=${sort}&order=${order}&search=${search}`}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${wPage <= 1 ? 'border-gray-200 text-gray-400 pointer-events-none' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Previous
                    </Link>
                    <Link 
                      href={`?w_page=${Math.min(wPage + 1, totalWaitlistPages)}&w_sort=${wSort}&w_order=${wOrder}&w_search=${wSearch}&page=${page}&sort=${sort}&order=${order}&search=${search}`}
                      className={`px-3 py-1 border rounded-md text-sm font-medium ${wPage >= totalWaitlistPages ? 'border-gray-200 text-gray-400 pointer-events-none' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      Next
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
