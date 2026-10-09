"use client";

import { useState } from "react";
import CancelButton from "./CancelButton";

type Attendee = {
  id: number;
  attendee_name: string;
  attendee_email: string;
  created_at: Date;
  booked_by_email: string;
  status: string;
};

export default function RosterTables({
  workshopId,
  activeRoster,
  waitlistRoster,
}: {
  workshopId: number;
  activeRoster: Attendee[];
  waitlistRoster: Attendee[];
}) {
  const [activePage, setActivePage] = useState(1);
  const [waitlistPage, setWaitlistPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("time_desc");
  const itemsPerPage = 10;

  // Active Roster Filtering & Sorting
  let processedActive = [...activeRoster];
  
  if (searchQuery.trim()) {
    const lowerQ = searchQuery.toLowerCase();
    processedActive = processedActive.filter(a => 
      a.attendee_name.toLowerCase().includes(lowerQ) || 
      a.attendee_email.toLowerCase().includes(lowerQ)
    );
  }

  processedActive.sort((a, b) => {
    if (sortBy === 'time_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'time_asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'alpha_asc') return a.attendee_name.localeCompare(b.attendee_name);
    if (sortBy === 'alpha_desc') return b.attendee_name.localeCompare(a.attendee_name);
    return 0;
  });

  // Active Roster Pagination
  const totalActivePages = Math.max(1, Math.ceil(processedActive.length / itemsPerPage));
  const activeStart = (activePage - 1) * itemsPerPage;
  const currentActive = processedActive.slice(activeStart, activeStart + itemsPerPage);

  // Waitlist Roster Pagination
  const totalWaitlistPages = Math.max(1, Math.ceil(waitlistRoster.length / itemsPerPage));
  const waitlistStart = (waitlistPage - 1) * itemsPerPage;
  const currentWaitlist = waitlistRoster.slice(waitlistStart, waitlistStart + itemsPerPage);

  const PaginationControls = ({
    currentPage,
    totalPages,
    setPage,
    totalItems,
  }: {
    currentPage: number;
    totalPages: number;
    setPage: (p: number) => void;
    totalItems: number;
  }) => {
    if (totalItems <= itemsPerPage) return null;

    return (
      <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full lg:w-2/3 space-y-8">
      {/* Active Roster */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Active Attendees Roster</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActivePage(1); }}
              className="block w-full sm:w-64 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setActivePage(1); }}
              className="block w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="time_desc">Newest First</option>
              <option value="time_asc">Oldest First</option>
              <option value="alpha_asc">Name (A-Z)</option>
              <option value="alpha_desc">Name (Z-A)</option>
            </select>
          </div>
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
              {currentActive.map((r) => (
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
              {processedActive.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    No active attendees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <PaginationControls
            currentPage={activePage}
            totalPages={totalActivePages}
            setPage={setActivePage}
            totalItems={processedActive.length}
          />
        </div>
      </div>

      {/* Waitlist Roster */}
      {waitlistRoster.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-orange-200 bg-orange-50/50">
            <h3 className="text-lg leading-6 font-medium text-orange-900">Waitlist Queue</h3>
            <p className="mt-1 text-sm text-orange-700">These attendees will be automatically promoted if an active seat opens up.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-200">
              <thead className="bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Queue #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Attendee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">Booked Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-orange-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-100">
                {currentWaitlist.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-500">
                      #{waitlistStart + idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{r.attendee_name}</div>
                      <div className="text-sm text-gray-500">{r.attendee_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <CancelButton registrationId={r.id} workshopId={workshopId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              currentPage={waitlistPage}
              totalPages={totalWaitlistPages}
              setPage={setWaitlistPage}
              totalItems={waitlistRoster.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}
